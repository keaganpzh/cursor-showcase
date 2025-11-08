from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BookmarkCreate(BaseModel):
    title: str
    url: str
    favicon: Optional[str] = None

class BookmarkResponse(BaseModel):
    id: int
    title: str
    url: str
    favicon: Optional[str]
    createdAt: datetime
    
    class Config:
        from_attributes = True

