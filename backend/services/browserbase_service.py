import os
import asyncio
from typing import Optional

try:
    from browserbase import Browserbase
    BROWSERBASE_AVAILABLE = True
except ImportError:
    BROWSERBASE_AVAILABLE = False
    Browserbase = None

BROWSERBASE_API_KEY = os.getenv("BROWSERBASE_API_KEY")

class BrowserbaseService:
    def __init__(self):
        self.api_key = BROWSERBASE_API_KEY
        
        if not self.api_key:
            raise ValueError("BROWSERBASE_API_KEY is not set")
        
        if not BROWSERBASE_AVAILABLE:
            raise ImportError(
                "Browserbase SDK not installed. Install it with: pip install browserbase"
            )
        
        self.client = Browserbase(api_key=self.api_key)
    
    async def navigate(self, url: str) -> dict:
        session = None
        try:
            loop = asyncio.get_event_loop()
            
            session = await loop.run_in_executor(
                None, 
                lambda: self.client.sessions.create()
            )
            
            await loop.run_in_executor(
                None,
                lambda: session.navigate(url=url)
            )
            
            content = await loop.run_in_executor(
                None,
                lambda: session.get_content()
            )
            
            await loop.run_in_executor(
                None,
                lambda: session.close()
            )
            
            html_content = ""
            title = ""
            final_url = url
            
            if isinstance(content, dict):
                html_content = content.get("html", content.get("content", ""))
                title = content.get("title", "")
                final_url = content.get("url", url)
            elif isinstance(content, str):
                html_content = content
            else:
                html_content = str(content)
            
            return {
                "html": html_content,
                "title": title,
                "url": final_url
            }
        except Exception as e:
            if session:
                try:
                    loop = asyncio.get_event_loop()
                    await loop.run_in_executor(None, lambda: session.close())
                except:
                    pass
            raise Exception(f"Error navigating to {url}: {str(e)}")

browserbase_service = None
if BROWSERBASE_AVAILABLE and BROWSERBASE_API_KEY:
    try:
        browserbase_service = BrowserbaseService()
    except Exception as e:
        print(f"Warning: Could not initialize Browserbase service: {e}")
        browserbase_service = None
