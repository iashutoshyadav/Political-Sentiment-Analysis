CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party TEXT NOT NULL,
    state TEXT,
    total_articles INTEGER DEFAULT 0,
    positive_count INTEGER DEFAULT 0,
    neutral_count INTEGER DEFAULT 0,
    negative_count INTEGER DEFAULT 0,
    avg_sentiment_score REAL DEFAULT 0.0,
    dominant_sentiment TEXT,
    insight TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
