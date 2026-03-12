import os
import sys

backend_root = os.path.dirname(os.path.abspath(__file__))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

import nltk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database.schema import create_all_tables
from app.routes import auth_routes, news_routes, sentiment_routes, report_routes
from app.utils.config import settings

def download_nltk_data():
    packages = ["vader_lexicon", "punkt", "brown", "averaged_perceptron_tagger"]
    for pkg in packages:
        try:
            nltk.download(pkg, quiet=True)
        except Exception:
            pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    download_nltk_data()
    create_all_tables()
    yield

app = FastAPI(
    title="Political News Sentiment Analysis API",
    description="API for analyzing sentiment of Indian political news articles",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(news_routes.router)
app.include_router(sentiment_routes.router)
app.include_router(report_routes.router)

@app.get("/")
def root():
    return {
        "message": "Political News Sentiment Analysis API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running",
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "Political News Sentiment API"}
