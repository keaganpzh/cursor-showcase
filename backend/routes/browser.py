from typing import List
from urllib.parse import urljoin, urlparse
import httpx
from httpx_socks import AsyncProxyTransport
from bs4 import BeautifulSoup
import re

from database import Bookmark, HistoryEntry, JSONStorage
from fastapi import APIRouter, HTTPException, Query, Response
from models.bookmark import BookmarkCreate, BookmarkResponse
from models.history import HistoryCreate, HistoryResponse
from services.proxy_manager import ProxyManager

router = APIRouter()

# Initialize proxy manager
proxy_manager = ProxyManager()


@router.get("/bookmarks", response_model=List[BookmarkResponse])
async def get_bookmarks():
    bookmarks = JSONStorage.get_all_bookmarks()
    bookmarks.sort(key=lambda x: x.createdAt, reverse=True)
    return [BookmarkResponse(**b.to_dict()) for b in bookmarks]


@router.post("/bookmarks", response_model=BookmarkResponse)
async def create_bookmark(bookmark: BookmarkCreate):
    existing = JSONStorage.find_bookmark_by_url(bookmark.url)
    if existing:
        raise HTTPException(status_code=400, detail="Bookmark already exists")

    bookmark_id = JSONStorage.get_next_id("bookmarks")
    db_bookmark = Bookmark(
        id=bookmark_id, title=bookmark.title, url=bookmark.url, favicon=bookmark.favicon
    )
    JSONStorage.add_bookmark(db_bookmark)
    return BookmarkResponse(**db_bookmark.to_dict())


@router.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark(bookmark_id: int):
    success = JSONStorage.delete_bookmark(bookmark_id)
    if not success:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return {"message": "Bookmark deleted"}


@router.get("/history", response_model=List[HistoryResponse])
async def get_history(limit: int = 50):
    history = JSONStorage.get_all_history(limit=limit)
    return [HistoryResponse(**h.to_dict()) for h in history]


@router.post("/history", response_model=HistoryResponse)
async def create_history_entry(history: HistoryCreate):
    entry_id = JSONStorage.get_next_id("history")
    db_history = HistoryEntry(id=entry_id, url=history.url, title=history.title)
    JSONStorage.add_history_entry(db_history)
    return HistoryResponse(**db_history.to_dict())


@router.delete("/history/{history_id}")
async def delete_history_entry(history_id: int):
    success = JSONStorage.delete_history_entry(history_id)
    if not success:
        raise HTTPException(status_code=404, detail="History entry not found")
    return {"message": "History entry deleted"}


@router.get("/proxy")
async def proxy_page(url: str = Query(..., description="URL to proxy"), use_proxy: bool = Query(True, description="Whether to use a proxy")):
    """
    Proxy endpoint that fetches a webpage and rewrites it to be embeddable in an iframe.
    This bypasses X-Frame-Options and Content-Security-Policy restrictions.
    """
    try:
        # Validate URL
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            raise HTTPException(status_code=400, detail="Invalid URL")
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        # Try to fetch with proxy first, fallback to direct connection
        response = None
        last_error = None
        
        if use_proxy and proxy_manager.proxies:
            # Try up to 3 proxies before falling back to direct connection
            proxy = proxy_manager.get_proxy_for_url(url)
            proxies_to_try = [proxy] if proxy else []
            
            # Add a couple more as backups
            for _ in range(2):
                backup = proxy_manager.get_random_proxy()
                if backup and backup not in proxies_to_try:
                    proxies_to_try.append(backup)
            
            for proxy in proxies_to_try[:3]:
                try:
                    if proxy.protocol == 'http':
                        # HTTP proxy
                        proxies = {
                            "http://": f"http://{proxy.ip}:{proxy.port}",
                            "https://": f"http://{proxy.ip}:{proxy.port}",
                        }
                        async with httpx.AsyncClient(
                            follow_redirects=True,
                            timeout=30.0,
                            proxies=proxies,
                            headers=headers
                        ) as client:
                            response = await client.get(url, headers=headers)
                            response.raise_for_status()
                            break
                    elif proxy.protocol in ['socks4', 'socks5']:
                        # SOCKS proxy
                        transport = AsyncProxyTransport.from_url(
                            f"{proxy.protocol}://{proxy.ip}:{proxy.port}"
                        )
                        async with httpx.AsyncClient(
                            follow_redirects=True,
                            timeout=30.0,
                            transport=transport,
                            headers=headers
                        ) as client:
                            response = await client.get(url, headers=headers)
                            response.raise_for_status()
                            break
                except Exception as e:
                    last_error = e
                    continue
        
        # Fallback to direct connection if proxy failed or not using proxy
        if response is None:
            async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
        
        # Process the response
        content_type = response.headers.get("content-type", "").lower()
        
        # Only process HTML content
        if "text/html" not in content_type:
            raise HTTPException(
                status_code=400, 
                detail="Only HTML content can be proxied"
            )
        
        html_content = response.text
        base_url = str(response.url)
        
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(html_content, "lxml")
        
        # Update base tag or add one if it doesn't exist
        base_tag = soup.find("base")
        if base_tag:
            base_tag["href"] = base_url
        else:
            base_tag = soup.new_tag("base", href=base_url)
            head = soup.find("head")
            if head:
                head.insert(0, base_tag)
            else:
                # Create head if it doesn't exist
                head = soup.new_tag("head")
                head.insert(0, base_tag)
                if soup.html:
                    soup.html.insert(0, head)
        
        # Rewrite relative URLs to absolute URLs
        # Links
        for tag in soup.find_all("a", href=True):
            tag["href"] = urljoin(base_url, tag["href"])
        
        # Images
        for tag in soup.find_all("img", src=True):
            tag["src"] = urljoin(base_url, tag["src"])
        
        # Scripts
        for tag in soup.find_all("script", src=True):
            tag["src"] = urljoin(base_url, tag["src"])
        
        # Stylesheets
        for tag in soup.find_all("link", href=True):
            tag["href"] = urljoin(base_url, tag["href"])
        
        # Forms
        for tag in soup.find_all("form", action=True):
            tag["action"] = urljoin(base_url, tag["action"])
        
        # Iframes
        for tag in soup.find_all("iframe", src=True):
            tag["src"] = urljoin(base_url, tag["src"])
        
        # Videos and audio
        for tag in soup.find_all(["video", "audio"], src=True):
            tag["src"] = urljoin(base_url, tag["src"])
        
        # Source tags
        for tag in soup.find_all("source", src=True):
            tag["src"] = urljoin(base_url, tag["src"])
        
        # Rewrite URLs in inline styles (background-image, etc.)
        for tag in soup.find_all(style=True):
            style = tag["style"]
            # Match url() patterns in CSS
            def rewrite_url(match):
                url_content = match.group(1).strip("'\"")
                if url_content.startswith(("http://", "https://", "//", "data:")):
                    return match.group(0)
                absolute_url = urljoin(base_url, url_content)
                return f"url('{absolute_url}')"
            
            tag["style"] = re.sub(
                r"url\(['\"]?([^'\")]+)['\"]?\)",
                rewrite_url,
                style,
                flags=re.IGNORECASE
            )
        
        # Rewrite @import in style tags
        for tag in soup.find_all("style"):
            if tag.string:
                def rewrite_import(match):
                    url_content = match.group(1).strip("'\"")
                    if url_content.startswith(("http://", "https://", "//", "data:")):
                        return match.group(0)
                    absolute_url = urljoin(base_url, url_content)
                    return f"@import url('{absolute_url}')"
                
                tag.string = re.sub(
                    r"@import\s+url\(['\"]?([^'\")]+)['\"]?\)",
                    rewrite_import,
                    tag.string,
                    flags=re.IGNORECASE
                )
        
        # Inject script to handle postMessage for iframe communication
        # This helps with sites that check window.top
        script_tag = soup.new_tag("script")
        script_tag.string = """
        (function() {
            // Override window.top to allow embedding
            try {
                Object.defineProperty(window, 'top', {
                    get: function() { return window; },
                    configurable: true
                });
            } catch(e) {}
            
            // Override window.parent
            try {
                Object.defineProperty(window, 'parent', {
                    get: function() { return window; },
                    configurable: true
                });
            } catch(e) {}
        })();
        """
        if soup.head:
            soup.head.append(script_tag)
        
        modified_html = str(soup)
        
        # Return the modified HTML
        return Response(
            content=modified_html,
            media_type="text/html",
            headers={
                "X-Frame-Options": "ALLOWALL",
                "Content-Security-Policy": "frame-ancestors *;",
            }
        )
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Failed to fetch URL: {e.response.status_code}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Request error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing page: {str(e)}"
        )
