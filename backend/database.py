import json
import os
from datetime import datetime
from typing import List, Optional
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
BOOKMARKS_FILE = DATA_DIR / "bookmarks.json"
HISTORY_FILE = DATA_DIR / "history.json"

DATA_DIR.mkdir(exist_ok=True)

def ensure_files_exist():
    if not BOOKMARKS_FILE.exists():
        BOOKMARKS_FILE.write_text("[]")
    if not HISTORY_FILE.exists():
        HISTORY_FILE.write_text("[]")

ensure_files_exist()

class Bookmark:
    def __init__(self, id: int, title: str, url: str, favicon: Optional[str] = None, createdAt: Optional[str] = None):
        self.id = id
        self.title = title
        self.url = url
        self.favicon = favicon
        self.createdAt = createdAt or datetime.utcnow().isoformat()
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "url": self.url,
            "favicon": self.favicon,
            "createdAt": self.createdAt
        }
    
    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id=data["id"],
            title=data["title"],
            url=data["url"],
            favicon=data.get("favicon"),
            createdAt=data.get("createdAt")
        )

class HistoryEntry:
    def __init__(self, id: int, url: str, title: str, visitedAt: Optional[str] = None):
        self.id = id
        self.url = url
        self.title = title
        self.visitedAt = visitedAt or datetime.utcnow().isoformat()
    
    def to_dict(self):
        return {
            "id": self.id,
            "url": self.url,
            "title": self.title,
            "visitedAt": self.visitedAt
        }
    
    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id=data["id"],
            url=data["url"],
            title=data["title"],
            visitedAt=data.get("visitedAt")
        )

class JSONStorage:
    @staticmethod
    def _load_bookmarks() -> List[dict]:
        try:
            with open(BOOKMARKS_FILE, "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    @staticmethod
    def _save_bookmarks(bookmarks: List[dict]):
        with open(BOOKMARKS_FILE, "w") as f:
            json.dump(bookmarks, f, indent=2)
    
    @staticmethod
    def _load_history() -> List[dict]:
        try:
            with open(HISTORY_FILE, "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    @staticmethod
    def _save_history(history: List[dict]):
        with open(HISTORY_FILE, "w") as f:
            json.dump(history, f, indent=2)
    
    @staticmethod
    def get_all_bookmarks() -> List[Bookmark]:
        data = JSONStorage._load_bookmarks()
        return [Bookmark.from_dict(item) for item in data]
    
    @staticmethod
    def add_bookmark(bookmark: Bookmark) -> Bookmark:
        bookmarks = JSONStorage._load_bookmarks()
        bookmark_dict = bookmark.to_dict()
        bookmarks.append(bookmark_dict)
        JSONStorage._save_bookmarks(bookmarks)
        return bookmark
    
    @staticmethod
    def delete_bookmark(bookmark_id: int) -> bool:
        bookmarks = JSONStorage._load_bookmarks()
        original_count = len(bookmarks)
        bookmarks = [b for b in bookmarks if b["id"] != bookmark_id]
        if len(bookmarks) < original_count:
            JSONStorage._save_bookmarks(bookmarks)
            return True
        return False
    
    @staticmethod
    def find_bookmark_by_url(url: str) -> Optional[Bookmark]:
        bookmarks = JSONStorage._load_bookmarks()
        for item in bookmarks:
            if item["url"] == url:
                return Bookmark.from_dict(item)
        return None
    
    @staticmethod
    def get_all_history(limit: Optional[int] = None) -> List[HistoryEntry]:
        history = JSONStorage._load_history()
        history_entries = [HistoryEntry.from_dict(item) for item in history]
        history_entries.sort(key=lambda x: x.visitedAt, reverse=True)
        if limit:
            history_entries = history_entries[:limit]
        return history_entries
    
    @staticmethod
    def add_history_entry(entry: HistoryEntry) -> HistoryEntry:
        history = JSONStorage._load_history()
        entry_dict = entry.to_dict()
        history.append(entry_dict)
        JSONStorage._save_history(history)
        return entry
    
    @staticmethod
    def delete_history_entry(entry_id: int) -> bool:
        history = JSONStorage._load_history()
        original_count = len(history)
        history = [h for h in history if h["id"] != entry_id]
        if len(history) < original_count:
            JSONStorage._save_history(history)
            return True
        return False
    
    @staticmethod
    def get_next_id(collection: str) -> int:
        if collection == "bookmarks":
            items = JSONStorage._load_bookmarks()
        elif collection == "history":
            items = JSONStorage._load_history()
        else:
            return 1
        
        if not items:
            return 1
        return max(item["id"] for item in items) + 1
