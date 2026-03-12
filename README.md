# 🗞 PolitiSense — Political News Sentiment Analysis System

A full-stack web application that automatically collects Indian political news articles and analyzes their sentiment using NLP.

## 🏗 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Tailwind CSS + Recharts |
| Backend | FastAPI (Python) + SQLAlchemy |
| Database | SQLite |
| NLP/AI | VADER + TextBlob (Ensemble) |
| Auth | JWT (python-jose) |
| PDF Reports | ReportLab |

## 📁 Project Structure

```
Political News/
├── frontend/          # React app (Vite)
├── backend/           # FastAPI app
├── sentiment-engine/  # Standalone NLP module
├── database/          # SQL schema files + DB
├── docs/              # Documentation
└── scripts/           # Helper scripts
```

## 🚀 Quick Start

### 1. Backend Setup
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```powershell
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

## 🔑 NewsAPI Configuration

1. Get a free API key at [newsapi.org](https://newsapi.org)
2. Edit `backend/.env`:
   ```
   NEWS_API_KEY=your_actual_key_here
   ```
   
> Without a real API key, the app uses **mock articles** with realistic data for demonstration.

## 🔐 Authentication

- Register a new account at `/signup`
- Login at `/login`
- JWT token stored in localStorage, auto-renewed

## 📊 Features

- **Dashboard**: Overview stats cards, sentiment distribution Pie chart, party comparison Bar chart, sentiment trend Line chart
- **Analysis**: Select party + state → fetch news → ensemble NLP analysis → article cards with sentiment badges + AI insight + PDF download
- **Reports**: Historical analyses table with per-entry PDF download

## 🤖 Sentiment Analysis Engine

Uses an **ensemble model**:
- VADER (60% weight) — rule-based lexicon, excellent for news
- TextBlob (40% weight) — machine learning polarity
- Party-specific keyword boosting/dampening
- Thresholds: `score >= 0.05` → Positive, `score <= -0.05` → Negative, else Neutral

## 🗄 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/news/fetch` | Fetch articles from NewsAPI |
| POST | `/sentiment/analyze` | Run ensemble analysis |
| GET | `/sentiment/history` | User's analysis history |
| GET | `/sentiment/stats` | Aggregated stats for charts |
| POST | `/report/generate` | Generate PDF report |

Interactive API docs available at **http://localhost:8000/docs**
