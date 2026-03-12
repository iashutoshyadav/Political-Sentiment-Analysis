from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database.connection import Base
from pydantic import BaseModel
from typing import Optional, Dict, Any

class Analysis(Base):
    __tablename__ = "analyses"
    id = Column(Integer, primary_key=True, index=True)
    party = Column(String, nullable=False)
    state = Column(String, nullable=True)
    total_articles = Column(Integer, default=0)
    positive_count = Column(Integer, default=0)
    neutral_count = Column(Integer, default=0)
    negative_count = Column(Integer, default=0)
    avg_sentiment_score = Column(Float, default=0.0)
    dominant_sentiment = Column(String, nullable=True)
    insight = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, nullable=True)

class AnalysisResponse(BaseModel):
    id: int
    party: str
    state: Optional[str]
    total_articles: int
    positive_count: int
    neutral_count: int
    negative_count: int
    avg_sentiment_score: float
    dominant_sentiment: Optional[str]
    insight: Optional[str]
    created_at: Optional[Any]
    class Config:
        from_attributes = True
