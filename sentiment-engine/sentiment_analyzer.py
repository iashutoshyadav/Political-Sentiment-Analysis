from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
from config import PARTY_CONTEXT_KEYWORDS

vader = SentimentIntensityAnalyzer()

def analyze(text: str, party: str = None) -> dict:
    if not text or not text.strip():
        return {"label": "Neutral", "score": 0.0}
    
    vader_score = vader.polarity_scores(text)["compound"]
    tb_score = TextBlob(text).sentiment.polarity
    
    ensemble = (vader_score * 0.6) + (tb_score * 0.4)
    
    if party and party in PARTY_CONTEXT_KEYWORDS:
        ctx = PARTY_CONTEXT_KEYWORDS[party]
        tl = text.lower()
        pos_boost = sum(0.02 for kw in ctx["positive"] if kw in tl)
        neg_boost = sum(0.02 for kw in ctx["negative"] if kw in tl)
        ensemble += pos_boost - neg_boost
    
    ensemble = max(-1.0, min(1.0, ensemble))
    
    if ensemble >= 0.05:
        label = "Positive"
    elif ensemble <= -0.05:
        label = "Negative"
    else:
        label = "Neutral"
    
    return {
        "label": label,
        "score": round(ensemble, 4),
        "vader": round(vader_score, 4),
        "textblob": round(tb_score, 4),
    }

def batch_analyze(articles: list, party: str = None) -> list:
    results = []
    for a in articles:
        text = f"{a.get('title', '')} {a.get('description', '')}".strip()
        result = analyze(text, party)
        results.append({**a, **result})
    return results
