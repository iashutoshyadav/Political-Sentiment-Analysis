from config import PARTY_CONTEXT_KEYWORDS

def get_context_score(text: str, party: str) -> float:
    if party not in PARTY_CONTEXT_KEYWORDS:
        return 0.0
    ctx = PARTY_CONTEXT_KEYWORDS[party]
    tl = text.lower()
    pos = sum(1 for kw in ctx["positive"] if kw in tl)
    neg = sum(1 for kw in ctx["negative"] if kw in tl)
    return round((pos - neg) * 0.03, 4)

def get_dominant_theme(text: str, party: str) -> str:
    if party not in PARTY_CONTEXT_KEYWORDS:
        return "General"
    ctx = PARTY_CONTEXT_KEYWORDS[party]
    tl = text.lower()
    pos_hits = [kw for kw in ctx["positive"] if kw in tl]
    neg_hits = [kw for kw in ctx["negative"] if kw in tl]
    if len(pos_hits) > len(neg_hits):
        return f"Positive theme: {', '.join(pos_hits[:3])}"
    elif len(neg_hits) > len(pos_hits):
        return f"Critical theme: {', '.join(neg_hits[:3])}"
    return "Balanced/Neutral"
