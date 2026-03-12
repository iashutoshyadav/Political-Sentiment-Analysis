CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    url TEXT,
    source TEXT,
    published_at TEXT,
    party TEXT,
    state TEXT,
    sentiment_label TEXT,
    sentiment_score REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
