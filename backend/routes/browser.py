from typing import List

from database import Bookmark, HistoryEntry, JSONStorage
from fastapi import APIRouter, HTTPException
from models.bookmark import BookmarkCreate, BookmarkResponse
from models.history import HistoryCreate, HistoryResponse

router = APIRouter()


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
