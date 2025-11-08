import re
from typing import List

from database import Bookmark, HistoryEntry, JSONStorage
from fastapi import APIRouter, HTTPException, Query
from models.bookmark import BookmarkCreate, BookmarkResponse
from models.history import HistoryCreate, HistoryResponse
from services.browserbase_service import browserbase_service
from services.html_sanitizer import sanitize_html

router = APIRouter()


def normalize_url(url: str) -> str:
    url = url.strip()
    if not url:
        raise ValueError("URL cannot be empty")

    if not re.match(r"^https?://", url, re.IGNORECASE):
        if "." in url and " " not in url:
            url = f"https://{url}"
        else:
            url = f"https://www.google.com/search?q={url.replace(' ', '+')}"

    return url


@router.post("/navigate")
async def navigate(url: str = Query(..., description="URL to navigate to")):
    try:
        if browserbase_service is None:
            raise HTTPException(
                status_code=500,
                detail="Browserbase service not configured. Please install browserbase SDK and set BROWSERBASE_API_KEY",
            )

        normalized_url = normalize_url(url)

        result = await browserbase_service.navigate(normalized_url)
        html_content = result.get("html", "")
        page_title = result.get("title", normalized_url)
        final_url = result.get("url", normalized_url)

        sanitized = sanitize_html(html_content, final_url)

        entry_id = JSONStorage.get_next_id("history")
        history_entry = HistoryEntry(
            id=entry_id,
            url=final_url,
            title=page_title or sanitized.get("title", final_url),
        )
        JSONStorage.add_history_entry(history_entry)

        return {
            "html": sanitized["html"],
            "title": sanitized["title"] or page_title,
            "url": final_url,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error navigating: {str(e)}")


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


@router.get("/search")
async def search(query: str):
    if browserbase_service is None:
        raise HTTPException(
            status_code=500,
            detail="Browserbase service not configured. Please install browserbase SDK and set BROWSERBASE_API_KEY",
        )

    normalized_query = query.strip().replace(" ", "+")
    search_url = f"https://www.google.com/search?q={normalized_query}"

    try:
        result = await browserbase_service.navigate(search_url)
        html_content = result.get("html", "")
        sanitized = sanitize_html(html_content, search_url)

        return {
            "html": sanitized["html"],
            "title": sanitized["title"] or f"Search: {query}",
            "url": search_url,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error performing search: {str(e)}"
        )
