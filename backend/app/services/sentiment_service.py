import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
sys.path.insert(0, root_path)
sys.path.insert(0, os.path.join(root_path, "sentiment-engine"))

# Lazy-loaded Analyzers
_vader_analyzer = None
_bert_analyzer = None

def get_vader_analyzer():
    global _vader_analyzer
    if _vader_analyzer is None:
        from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
        _vader_analyzer = SentimentIntensityAnalyzer()
    return _vader_analyzer

def get_bert_analyzer():
    global _bert_analyzer
    if _bert_analyzer is None:
        try:
            # Import transformers only when needed to save startup RAM
            from transformers import pipeline
            
            # Using TinyBERT for extreme memory efficiency on Render Free Tier
            _bert_analyzer = pipeline(
                "sentiment-analysis",
                model="mrm8488/tinybert-finetuned-sentiment-analysis",
                truncation=True,
                max_length=512,
                device=-1 # Ensure CPU
            )
        except Exception as e:
            print(f"Warning: Could not load BERT analyzer: {e}. Falling back to VADER/TextBlob.")
            return None
    return _bert_analyzer

CONTEXT_POSITIVE_KEYWORDS = [
    "win", "victory", "majority", "support",
    "success", "development", "approval"
]

CONTEXT_NEGATIVE_KEYWORDS = [
    "loss", "defeat", "protest", "criticism", 
    "scandal", "corruption", "controversy"
]

def analyze_sentiment(text: str, party: str = None) -> dict:
    if not text or not text.strip():
        return {
            "label": "Neutral", "score": 0.0, "vader_score": 0.0, 
            "textblob_score": 0.0, "bert_score": 0.0, "adjusted_score": 0.0
        }
    
    vader_analyzer = get_vader_analyzer()
    vader_scores = vader_analyzer.polarity_scores(text)
    vader_compound = vader_scores["compound"]
    
    from textblob import TextBlob
    tb = TextBlob(text)
    tb_polarity = tb.sentiment.polarity
    
    bert_analyzer = get_bert_analyzer()
    if bert_analyzer:
        try:
            bert_result = bert_analyzer(text)[0]
            bert_label = bert_result['label'].lower()
            
            if bert_label == 'label_1' or bert_label == 'positive': # Adjusting for TinyBERT label names
                bert_score = bert_result['score']
            elif bert_label == 'label_0' or bert_label == 'negative':
                bert_score = -bert_result['score']
            else:
                bert_score = 0.0
        except Exception:
            bert_score = 0.0
    else:
        bert_score = 0.0
    
    ensemble_score = (vader_compound * 0.25) + (tb_polarity * 0.15) + (bert_score * 0.6)
    
    adjusted_score = ensemble_score
    if party and party.lower() in text.lower():
        text_lower = text.lower()
        pos_hits = sum(1 for kw in CONTEXT_POSITIVE_KEYWORDS if kw in text_lower)
        neg_hits = sum(1 for kw in CONTEXT_NEGATIVE_KEYWORDS if kw in text_lower)
        
        # Slight adjustment based on context keywords
        adjusted_score += (pos_hits * 0.05) - (neg_hits * 0.05)
    
    # Clamp to [-1.0, 1.0]
    adjusted_score = max(-1.0, min(1.0, adjusted_score))
    
    if adjusted_score >= 0.05:
        label = "Positive"
    elif adjusted_score <= -0.05:
        label = "Negative"
    else:
        label = "Neutral"
    
    return {
        "label": label,
        "score": round(adjusted_score, 4), # Primary score used by frontend
        "vader_score": round(vader_compound, 4),
        "textblob_score": round(tb_polarity, 4),
        "bert_score": round(bert_score, 4),
        "adjusted_score": round(adjusted_score, 4)
    }

def analyze_articles(articles: list, party: str = None) -> dict:
    results = []
    for article in articles:
        text = f"{article.get('title', '')} {article.get('description', '')}".strip()
        sentiment = analyze_sentiment(text, party)
        article["sentiment_label"] = sentiment["label"]
        article["sentiment_score"] = sentiment["score"]
        results.append(article)
    
    positive = [a for a in results if a["sentiment_label"] == "Positive"]
    neutral = [a for a in results if a["sentiment_label"] == "Neutral"]
    negative = [a for a in results if a["sentiment_label"] == "Negative"]
    
    total = len(results)
    avg_score = round(sum(a["sentiment_score"] for a in results) / total, 4) if total > 0 else 0.0
    
    counts = {"Positive": len(positive), "Neutral": len(neutral), "Negative": len(negative)}
    dominant = max(counts, key=counts.get) if total > 0 else "Neutral"
    
    return {
        "articles": results,
        "summary": {
            "total": total,
            "positive": len(positive),
            "neutral": len(neutral),
            "negative": len(negative),
            "avg_score": avg_score,
            "dominant_sentiment": dominant,
        }
    }
