from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from app.database.connection import Base
from pydantic import BaseModel
from typing import Optional

class Article(Base):
    __tablename__ = "articles"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    url = Column(String, nullable=True)
    source = Column(String, nullable=True)
    published_at = Column(String, nullable=True)
    party = Column(String, nullable=True)
    state = Column(String, nullable=True)
    sentiment_label = Column(String, nullable=True)
    sentiment_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ArticleResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    url: Optional[str]
    source: Optional[str]
    published_at: Optional[str]
    party: Optional[str]
    state: Optional[str]
    sentiment_label: Optional[str]
    sentiment_score: Optional[float]
    class Config:
        from_attributes = True
