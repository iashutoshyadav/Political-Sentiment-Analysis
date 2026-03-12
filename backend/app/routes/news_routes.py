from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.news_service import fetch_news
from app.models.article_model import Article, ArticleResponse
from app.utils.security import get_current_user
from typing import List, Optional

router = APIRouter(prefix="/news", tags=["News"])

@router.get("/fetch")
def fetch_political_news(
    party: str = Query("BJP"),
    state: Optional[str] = Query(None),
    page_size: int = Query(15, le=30),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    articles_data = fetch_news(party, state, page_size)
    saved = []
    for a in articles_data:
        existing = db.query(Article).filter(Article.title == a["title"], Article.party == party).first()
        if not existing:
            article = Article(**{k: v for k, v in a.items() if hasattr(Article, k)})
            db.add(article)
            saved.append(article)
    db.commit()
    return {"articles": articles_data, "total": len(articles_data), "party": party, "state": state}
