from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.services.news_service import fetch_news
from app.services.sentiment_service import analyze_articles
from app.models.article_model import Article
from app.models.analysis_model import Analysis, AnalysisResponse
from app.utils.security import get_current_user
from pydantic import BaseModel
from typing import Optional, List
import json

router = APIRouter(prefix="/sentiment", tags=["Sentiment"])

class AnalyzeRequest(BaseModel):
    party: str
    state: Optional[str] = None
    page_size: int = 15

@router.post("/analyze")
def analyze(req: AnalyzeRequest, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    articles_data = fetch_news(req.party, req.state, req.page_size)
    result = analyze_articles(articles_data, req.party)
    summary = result["summary"]
    
    for a in result["articles"]:
        existing = db.query(Article).filter(Article.title == a["title"], Article.party == req.party).first()
        if existing:
            existing.sentiment_label = a["sentiment_label"]
            existing.sentiment_score = a["sentiment_score"]
        else:
            article = Article(
                title=a.get("title", ""),
                description=a.get("description", ""),
                content=a.get("content", ""),
                url=a.get("url", ""),
                source=a.get("source", ""),
                published_at=a.get("published_at", ""),
                party=req.party,
                state=req.state or "All States",
                sentiment_label=a["sentiment_label"],
                sentiment_score=a["sentiment_score"],
            )
            db.add(article)
    
    dominant = summary["dominant_sentiment"]
    score = summary["avg_score"]
    if dominant == "Positive" and score > 0.2:
        insight = f"{req.party} is receiving strongly positive media coverage with {summary['positive']} out of {summary['total']} articles showing a favorable tone."
    elif dominant == "Negative" and score < -0.2:
        insight = f"{req.party} faces significant negative media coverage with {summary['negative']} articles carrying a critical tone."
    else:
        insight = f"Media coverage of {req.party} is mixed with {summary['positive']} positive, {summary['neutral']} neutral, and {summary['negative']} negative articles out of {summary['total']} total."

    analysis = Analysis(
        party=req.party,
        state=req.state or "All States",
        total_articles=summary["total"],
        positive_count=summary["positive"],
        neutral_count=summary["neutral"],
        negative_count=summary["negative"],
        avg_sentiment_score=summary["avg_score"],
        dominant_sentiment=dominant,
        insight=insight,
        user_id=current_user.id,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    
    return {
        "analysis_id": analysis.id,
        "party": req.party,
        "state": req.state,
        "summary": summary,
        "insight": insight,
        "articles": result["articles"],
    }

@router.get("/history", response_model=List[AnalysisResponse])
def get_history(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    analyses = db.query(Analysis).filter(Analysis.user_id == current_user.id).order_by(Analysis.created_at.desc()).limit(50).all()
    return analyses

@router.get("/stats")
def get_stats(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    analyses = db.query(Analysis).filter(Analysis.user_id == current_user.id).all()
    if not analyses:
        return {"party_stats": [], "total_analyses": 0, "overall_positive": 0, "overall_negative": 0, "overall_neutral": 0}
    
    party_map = {}
    for a in analyses:
        if a.party not in party_map:
            party_map[a.party] = {"party": a.party, "positive": 0, "neutral": 0, "negative": 0, "total": 0, "avg_score": 0.0}
        party_map[a.party]["positive"] += a.positive_count
        party_map[a.party]["neutral"] += a.neutral_count
        party_map[a.party]["negative"] += a.negative_count
        party_map[a.party]["total"] += a.total_articles
    
    for p in party_map.values():
        if p["total"] > 0:
            p["avg_score"] = round((p["positive"] - p["negative"]) / p["total"], 2)
    
    total_pos = sum(a.positive_count for a in analyses)
    total_neu = sum(a.neutral_count for a in analyses)
    total_neg = sum(a.negative_count for a in analyses)
    
    return {
        "party_stats": list(party_map.values()),
        "total_analyses": len(analyses),
        "overall_positive": total_pos,
        "overall_neutral": total_neu,
        "overall_negative": total_neg,
    }
