def generate_insight(party: str, summary: dict) -> str:
    total = summary.get("total", 0)
    pos = summary.get("positive", 0)
    neu = summary.get("neutral", 0)
    neg = summary.get("negative", 0)
    score = summary.get("avg_score", 0.0)
    dominant = summary.get("dominant_sentiment", "Neutral")

    if total == 0:
        return f"No articles found for {party}."

    pct_pos = round(pos / total * 100)
    pct_neg = round(neg / total * 100)

    if dominant == "Positive" and score > 0.3:
        return f"{party} enjoys highly positive media coverage — {pct_pos}% of {total} articles carry a favorable tone, indicating strong public perception and favorable news cycle."
    elif dominant == "Positive" and score > 0.1:
        return f"{party} has moderately positive media coverage, with {pos} out of {total} articles showing a favorable tone. Neutral reporting is also significant at {neu} articles."
    elif dominant == "Negative" and score < -0.3:
        return f"{party} is facing intense negative media attention — {pct_neg}% of {total} articles carry a critical tone, suggesting controversy or policy challenges in the news cycle."
    elif dominant == "Negative" and score < -0.1:
        return f"Media coverage of {party} leans negative, with {neg} out of {total} articles expressing criticism. This could indicate public dissatisfaction or ongoing political challenges."
    else:
        return f"Coverage of {party} is mixed: {pos} positive, {neu} neutral, {neg} negative articles out of {total} total. The overall sentiment score is {score:+.2f}, reflecting a balanced media environment."
