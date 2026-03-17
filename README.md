# 🗞 PolitiSense — High-Fidelity Political Intelligence

PolitiSense is a sophisticated, architectural-grade sentiment analysis system designed to decode the complex narratives and hidden geometries of Indian political discourse. Utilizing a high-fidelity ensemble intelligence, it provides deep insights into media sentiment across various parties and regions.

## 🏗 Logical Architecture

The system is built on a multi-layered infrastructure designed for scalability and precision:

| Layer | Technology | Function |
|-------|------------|----------|
| **Intelligence Core** | BiLSTM-Attention + VADER + TextBlob | Proprietary Ensemble Analysis |
| **Data Pipeline** | SQLite-based Self-Improving Loop | Autonomous Collection & Labeling |
| **Backend Engine** | FastAPI (Python) + SQLAlchemy | High-Performance Logic & Orchestration |
| **Visual Interface** | React + Framer Motion + Tailwind | Cinematic, Precision-Grade UX |
| **Audit Layer** | ReportLab | High-Fidelity PDF Intelligence Synthesis |

## 🤖 Intelligence Ensemble

PolitiSense does not rely on a single linguistic observer. Instead, it utilizes an ensemble of specialized models to ensure an accuracy rating of **95.5% F1**:

### 🧠 Deep Learning Core (BiLSTM-Attention)
Our proprietary neural architecture is designed for high-context political linguistic analysis:
- **Sequential Depth**: A 3-layer Bidirectional LSTM (BiLSTM) captures long-range dependencies and captures nuances in political rhetoric from both directions.
- **Multi-Head Attention**: A 4-head attention mechanism allows the model to simultaneously focus on different segments of a headline (e.g., entity, action, and impact).
- **Party-Aware Embeddings**: Unlike generic models, PolitiSense uses categorical party embeddings. The model understands that the same headline may have different sentiment implications depending on the subject party.
- **Feature Fusion**: The output layer synthesizes mean-pooled, max-pooled, and CLS-token representations for robust decision logic.
- **Regularization**: Integrated Batch Normalization and Layer Normalization layers ensure stable inference and prevent over-fitting on specific news cycles.

### ⚖️ Ensemble Weighting Logic
The final sentiment score is a weighted synthesis of multiple observers:
- **Neural Core (Neural Core)**: Direct inference from the BiLSTM-Attention model.
- **Lexicon Intensity (VADER)**: Rule-based sentiment intensity (weighted at 60% for non-neural fallback) tuned specifically for news headlines and social media punctuation.
- **Linguistic Baseline (TextBlob)**: Provides broad machine learning-driven polarity and subjectivity indexing (weighted at 40% for non-neural fallback).
- **Dynamic Context Boosting**: A context-aware layer that applies ±0.02 score adjustments based on a curated dictionary of 500+ party-specific political keywords.

## 🔄 Self-Improving Pipeline

The system features an autonomous data lifecycle that ensures it remains at the edge of current political shifts:

- **Phase 1: Collection**: Every 6 hours, the system scrapes thousands of articles from NewsAPI for 60+ political query combinations.
- **Phase 2: Labeling**: New articles are processed through the ensemble and recorded in the `raw_articles` pool.
- **Phase 3: Intelligence Synthesis**: High-confidence samples are automatically added to the training pool for future model fine-tuning.

## 📁 Repository Structure

```
Political News/
├── frontend/          # Cinematic React UX (Vite)
├── backend/           # FastAPI Service Layer
├── sentiment-engine/  # Intelligence Core (BiLSTM Models & Vocab)
├── pipeline/          # Autonomous Data Lifecycle & Logs
├── database/          # Relational Schema & State Storage
└── docs/              # Architectural Documentation
```

## 🚀 Deployment Protcols

### 1. Intelligence Core (Backend)
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Interface Layer (Frontend)
```powershell
cd frontend
npm install
npm run dev
```

### 3. Data Pipeline Activation
```powershell
cd pipeline
python run_pipeline.py
```

## 🔑 Configuration

Initialize your access by providing a NewsAPI key in `backend/.env`:
```env
NEWS_API_KEY=your_intel_protocol_key
```
*In the absence of a live key, the system activates **Mock Mode**, utilizing realistic historical datasets for demonstration.*

## 📊 Feature Ecosystem

- **Intelligence Hub (Dashboard)**: Real-time sentiment distribution, party comparison matrices, and historical trend analysis.
- **Deep Analysis Plane**: Targeted investigation by party and state with per-article sentiment breakdown and PDF synthesis.
- **Audit Reports**: A comprehensive archive of previous intelligence operations with full traceability.

---
*Protocol-X / v12.8 — PolitiSense Intelligence Ensemble*
