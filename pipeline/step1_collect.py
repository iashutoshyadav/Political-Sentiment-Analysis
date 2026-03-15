# pipeline/step1_collect.py
# =====================================================
# Collects fresh Indian political news every 6 hours
# and stores raw articles in SQLite for labeling.
#
# Run manually:   python step1_collect.py
# Or schedule:    see schedule_pipeline.py
# =====================================================

import os, sys, re, json, time, sqlite3, hashlib, requests
from datetime import datetime

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH   = os.path.join(ROOT, "pipeline", "pipeline.db")
LOG_PATH  = os.path.join(ROOT, "pipeline", "logs", "collect.log")
os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)

# ── Config ────────────────────────────────────────────────────────────────────
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "40dd56b5e3c3461ba3c766de516953d3")   # set in .env
FETCH_LIMIT  = 100   # articles per query
QUERIES = [
    # BJP
    "BJP India politics",
    "Modi government India",
    "Amit Shah BJP",
    "BJP election India",
    "BJP win loss India",
    # INC
    "Congress India politics",
    "Rahul Gandhi India",
    "Congress election India",
    "Kharge Congress party",
    "Priyanka Gandhi politics",
    # AAP
    "AAP Kejriwal politics",
    "Bhagwant Mann AAP Punjab",
    "AAP Delhi government",
    # SP BSP
    "Samajwadi Party Akhilesh",
    "BSP Mayawati politics",
    # TMC
    "TMC Mamata Bengal politics",
    "Mamata Banerjee TMC",
    # South India
    "DMK Stalin Tamil Nadu",
    "AIADMK Edappadi Tamil Nadu",
    "TRS BRS KCR Telangana",
    "TDP Chandrababu Andhra",
    "YSRCP Jagan Andhra",
    "BJD Naveen Patnaik Odisha",
    # Other
    "NCP Sharad Pawar Maharashtra",
    "Shiv Sena Uddhav Thackeray",
    "JDU Nitish Kumar Bihar",
    "RJD Tejashwi Lalu Bihar",
    "CPI Communist Kerala politics",
    # General
    "India election parliament 2026",
    "India opposition ruling party",
]

# ── Political filter ──────────────────────────────────────────────────────────
POLITICAL_MUST = [
    "bjp","congress","aap","samajwadi","bsp","trinamool","tmc",
    "ncp","shiv sena","cpim","jdu","rjd","trs","brs","tdp","ysrcp",
    "dmk","aiadmk","bjd","jds","modi","rahul gandhi","kejriwal",
    "mamata","akhilesh","mayawati","nitish kumar","lalu","tejashwi",
    "chandrababu","jagan","stalin","yogi","amit shah",
    "election","parliament","lok sabha","rajya sabha","minister",
    "government","political","bypolls","assembly","mla ","chief minister",
    "opposition","ruling","coalition","alliance","rally","constituency",
    "ed raid","cbi","scam","corruption","arrested minister",
]
NON_POLITICAL = [
    "cricket","ipl","football","tennis","icc","bcci","gambhir",
    "virat kohli","rohit sharma","bollywood","box office","netflix",
    "sensex","nifty","bitcoin","cryptocurrency","iphone","recipe",
    "fashion","horoscope","weather forecast",
]

def is_political(text):
    t = text.lower()
    for kw in NON_POLITICAL:
        if kw in t: return False
    for kw in POLITICAL_MUST:
        if kw in t: return True
    return False

def article_hash(title):
    return hashlib.md5(title.lower().strip().encode()).hexdigest()

# ── Database ──────────────────────────────────────────────────────────────────
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c    = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS raw_articles (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            title        TEXT NOT NULL,
            description  TEXT,
            url          TEXT,
            source       TEXT,
            published_at TEXT,
            hash         TEXT UNIQUE,
            collected_at TEXT DEFAULT CURRENT_TIMESTAMP,
            labeled      INTEGER DEFAULT 0,
            label        TEXT,
            score        REAL,
            confidence   REAL,
            party        TEXT,
            added_to_training INTEGER DEFAULT 0
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS pipeline_log (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            event      TEXT,
            details    TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def save_articles(articles):
    conn = sqlite3.connect(DB_PATH)
    c    = conn.cursor()
    saved = 0
    for a in articles:
        h = article_hash(a["title"])
        try:
            c.execute("""
                INSERT INTO raw_articles (title, description, url, source, published_at, hash)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (a["title"], a.get("description",""), a.get("url",""),
                  a.get("source",""), a.get("published_at",""), h))
            saved += 1
        except sqlite3.IntegrityError:
            pass   # duplicate — already exists
    conn.commit()
    conn.close()
    return saved

def log_event(event, details=""):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("INSERT INTO pipeline_log (event, details) VALUES (?,?)", (event, details))
    conn.commit()
    conn.close()
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {event}: {details}")

# ── Fetch ─────────────────────────────────────────────────────────────────────
def fetch_query(query):
    if not NEWS_API_KEY:
        print("  WARNING: NEWS_API_KEY not set — skipping API fetch")
        return []
    try:
        resp = requests.get("https://newsapi.org/v2/everything", params={
            "q": query, "language": "en", "sortBy": "publishedAt",
            "pageSize": FETCH_LIMIT, "apiKey": NEWS_API_KEY,
        }, timeout=10)
        data = resp.json()
        if data.get("status") != "ok":
            return []
        articles = []
        for a in data.get("articles", []):
            title = a.get("title","") or ""
            desc  = a.get("description","") or ""
            if not title or "[Removed]" in title: continue
            if not is_political(f"{title} {desc}"): continue
            articles.append({
                "title":        title,
                "description":  desc,
                "url":          a.get("url",""),
                "source":       a.get("source",{}).get("name",""),
                "published_at": a.get("publishedAt",""),
            })
        return articles
    except Exception as e:
        print(f"  Error fetching '{query}': {e}")
        return []

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 55)
    print("  Step 1: Collecting fresh political news")
    print("=" * 55)

    init_db()
    total_saved = 0

    for query in QUERIES:
        print(f"\nFetching: {query}")
        articles = fetch_query(query)
        saved    = save_articles(articles)
        total_saved += saved
        print(f"  Fetched: {len(articles)} | New saved: {saved}")
        time.sleep(0.5)   # rate limit

    # Count totals
    conn = sqlite3.connect(DB_PATH)
    total_raw     = conn.execute("SELECT COUNT(*) FROM raw_articles").fetchone()[0]
    total_unlabeled = conn.execute("SELECT COUNT(*) FROM raw_articles WHERE labeled=0").fetchone()[0]
    conn.close()

    log_event("COLLECT", f"saved={total_saved} total_raw={total_raw} unlabeled={total_unlabeled}")
    print(f"\n{'='*55}")
    print(f"  New articles saved:  {total_saved}")
    print(f"  Total in database:   {total_raw}")
    print(f"  Unlabeled pending:   {total_unlabeled}")
    print(f"  Next: run step2_label.py")
    print(f"{'='*55}")