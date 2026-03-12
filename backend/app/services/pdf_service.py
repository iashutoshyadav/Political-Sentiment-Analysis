import io
import os
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT

SENTIMENT_COLORS = {
    "Positive": colors.HexColor("#22c55e"),
    "Neutral": colors.HexColor("#f59e0b"),
    "Negative": colors.HexColor("#ef4444"),
}

def generate_pdf_report(analysis_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=60, bottomMargin=60)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle("Title", parent=styles["Title"], fontSize=22, textColor=colors.HexColor("#1e293b"), spaceAfter=6, alignment=TA_CENTER)
    subtitle_style = ParagraphStyle("Subtitle", parent=styles["Normal"], fontSize=12, textColor=colors.HexColor("#64748b"), spaceAfter=20, alignment=TA_CENTER)
    heading_style = ParagraphStyle("Heading", parent=styles["Heading2"], fontSize=14, textColor=colors.HexColor("#1e40af"), spaceBefore=15, spaceAfter=8)
    body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, textColor=colors.HexColor("#374151"), spaceAfter=6)
    
    story = []
    
    story.append(Paragraph("🗞 Political News Sentiment Analysis", title_style))
    story.append(Paragraph(f"Report generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1e40af")))
    story.append(Spacer(1, 15))
    
    party = analysis_data.get("party", "Unknown")
    state = analysis_data.get("state", "All States")
    summary = analysis_data.get("summary", {})
    insight = analysis_data.get("insight", "")
    
    story.append(Paragraph("Analysis Overview", heading_style))
    
    overview_data = [
        ["Parameter", "Value"],
        ["Political Party", party],
        ["State / Region", state or "All States"],
        ["Total Articles Analyzed", str(summary.get("total", 0))],
        ["Dominant Sentiment", summary.get("dominant_sentiment", "Neutral")],
        ["Average Sentiment Score", str(summary.get("avg_score", 0.0))],
    ]
    
    overview_table = Table(overview_data, colWidths=[200, 250])
    overview_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f8fafc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(overview_table)
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("Sentiment Distribution", heading_style))
    
    pos = summary.get("positive", 0)
    neu = summary.get("neutral", 0)
    neg = summary.get("negative", 0)
    total = summary.get("total", 1)
    
    sentiment_data = [
        ["Sentiment", "Count", "Percentage"],
        ["✅ Positive", str(pos), f"{round(pos/total*100, 1)}%"],
        ["⚪ Neutral", str(neu), f"{round(neu/total*100, 1)}%"],
        ["❌ Negative", str(neg), f"{round(neg/total*100, 1)}%"],
    ]
    
    sent_table = Table(sentiment_data, colWidths=[150, 100, 200])
    sent_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 1), (0, 1), colors.HexColor("#dcfce7")),
        ("BACKGROUND", (0, 2), (0, 2), colors.HexColor("#fef9c3")),
        ("BACKGROUND", (0, 3), (0, 3), colors.HexColor("#fee2e2")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
    ]))
    story.append(sent_table)
    story.append(Spacer(1, 15))
    
    if insight:
        story.append(Paragraph("AI-Generated Insight", heading_style))
        story.append(Paragraph(insight, body_style))
        story.append(Spacer(1, 10))
    
    articles = analysis_data.get("articles", [])
    if articles:
        story.append(Paragraph("Top Analyzed Articles", heading_style))
        for i, article in enumerate(articles[:8], 1):
            title = article.get("title", "N/A")
            sentiment = article.get("sentiment_label", "Neutral")
            score = article.get("sentiment_score", 0.0)
            source = article.get("source", "Unknown")
            
            sent_color = {"Positive": "#22c55e", "Negative": "#ef4444"}.get(sentiment, "#f59e0b")
            story.append(Paragraph(f"<b>{i}. {title}</b>", body_style))
            story.append(Paragraph(f"Source: {source} | Sentiment: <font color='{sent_color}'><b>{sentiment}</b></font> | Score: {score}", body_style))
            story.append(Spacer(1, 5))
    
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0")))
    story.append(Paragraph("Political News Sentiment Analysis System | Generated by AI/NLP Engine", subtitle_style))
    
    doc.build(story)
    buffer.seek(0)
    return buffer.read()
