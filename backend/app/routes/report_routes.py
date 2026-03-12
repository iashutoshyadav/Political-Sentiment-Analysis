from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from app.services.pdf_service import generate_pdf_report
from app.services.news_service import fetch_news
from app.services.sentiment_service import analyze_articles
from app.models.analysis_model import Analysis
from app.database.connection import get_db
from app.utils.security import get_current_user
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/report", tags=["Reports"])

class ReportRequest(BaseModel):
    analysis_id: Optional[int] = None
    party: Optional[str] = "BJP"
    state: Optional[str] = None

@router.post("/generate")
def generate_report(req: ReportRequest, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if req.analysis_id:
        analysis = db.query(Analysis).filter(Analysis.id == req.analysis_id, Analysis.user_id == current_user.id).first()
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        analysis_data = {
            "party": analysis.party,
            "state": analysis.state,
            "insight": analysis.insight,
            "summary": {
                "total": analysis.total_articles,
                "positive": analysis.positive_count,
                "neutral": analysis.neutral_count,
                "negative": analysis.negative_count,
                "avg_score": analysis.avg_sentiment_score,
                "dominant_sentiment": analysis.dominant_sentiment,
            },
            "articles": [],
        }
    else:
        articles_data = fetch_news(req.party or "BJP", req.state, 10)
        result = analyze_articles(articles_data, req.party)
        summary = result["summary"]
        dominant = summary["dominant_sentiment"]
        insight = f"Media coverage of {req.party} shows {dominant.lower()} sentiment with {summary['total']} articles analyzed."
        analysis_data = {
            "party": req.party,
            "state": req.state or "All States",
            "insight": insight,
            "summary": summary,
            "articles": result["articles"],
        }
    
    pdf_bytes = generate_pdf_report(analysis_data)
    filename = f"sentiment_report_{analysis_data['party']}_{analysis_data['state'] or 'all'}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
