from pydantic import BaseModel
from datetime import datetime

class HistoryCreate(BaseModel):
    url: str
    title: str

class HistoryResponse(BaseModel):
    id: int
    url: str
    title: str
    visitedAt: datetime
    
    class Config:
        from_attributes = True

