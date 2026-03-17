import requests
from app.utils.config import settings

PARTIES_KEYWORDS = {
    "BJP": ["BJP", "Bharatiya Janata Party", "Modi", "Amit Shah", "Yogi"],
    "INC": ["Congress", "INC", "Rahul Gandhi", "Sonia Gandhi", "AICC"],
    "AAP": ["AAP", "Aam Aadmi Party", "Arvind Kejriwal", "Manish Sisodia"],
    "SP": ["SP", "Samajwadi Party", "Akhilesh Yadav"],
    "BSP": ["BSP", "Bahujan Samaj Party", "Mayawati"],
    "TMC": ["TMC", "Trinamool Congress", "Mamata Banerjee"],
    "NCP": ["NCP", "Nationalist Congress Party", "Sharad Pawar"],
    "SS": ["Shiv Sena", "Uddhav Thackeray"],
    "CPI(M)": ["CPI", "Communist Party", "Left Front"],
    "JDU": ["JDU", "Janata Dal United", "Nitish Kumar"],
    "RJD": ["RJD", "Rashtriya Janata Dal", "Lalu Prasad"],
}
POLITICAL_KEYWORDS = [
    "politics", "election", "government", "minister", 
    "parliament", "policy", "political party", "campaign"
]

NEGATIVE_KEYWORDS = [
    "sports", "football", "cricket", "celebrity", 
    "entertainment", "movie", "billionaire"
]

TRUSTED_DOMAINS = "timesofindia.indiatimes.com,thehindu.com,indianexpress.com,ndtv.com,hindustantimes.com,indiatoday.in,theprint.in,firstpost.com,thequint.com,deccanherald.com,business-standard.com,livemint.com,news18.com"

def fetch_news(party: str, state: str = None, page_size: int = 20) -> list:
    query = f"{party}"
    if state and state != "All States":
        query += f" {state}"
    query += " India politics"
    
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": page_size,
        "apiKey": settings.news_api_key,
    }
    
    try:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if data.get("status") == "ok":
            raw_articles = data.get("articles", [])
            valid_articles = []
            
            for a in raw_articles:
                title = a.get("title") or ""
                if not title or "[Removed]" in title:
                    continue
                    
                valid_articles.append({
                    "title": title,
                    "description": a.get("description") or "",
                    "content": a.get("content", ""),
                    "url": a.get("url", ""),
                    "source": a.get("source", {}).get("name", ""),
                    "urlToImage": a.get("urlToImage", ""),
                    "published_at": a.get("publishedAt", ""),
                    "party": party,
                    "state": state or "All States",
                })
                if len(valid_articles) == page_size:
                    break
                    
            print(f"Fetched {len(valid_articles)} raw news items directly from API matching reference app.")
            return valid_articles
        else:
            print(f"API Error: {data}")
            return get_mock_articles(party, state, page_size)
    except Exception as e:
        print(f"Network error in fetch_news: {e}")
        return get_mock_articles(party, state, page_size)

def get_mock_articles(party: str, state: str = None, count: int = 10) -> list:
    import random
    from datetime import datetime, timedelta
    
    positive_templates = [
        f"{party} secures major victory in {state or 'recent'} assembly elections with overwhelming majority.",
        f"Chief Minister from {party} announces massive development package and new welfare policy.",
        f"{party} rally draws record crowds, showing strong public support for government reforms.",
        f"Economic growth accelerates under {party} leadership, minister claims success."
    ]
    
    negative_templates = [
        f"Opposition leaders protest against {party} over alleged corruption scandal and policy failure.",
        f"{party} faces heavy criticism after sudden defeat in local parliament bypolls.",
        f"Controversy surrounds {party} minister as new scam allegations surface.",
        f"Public anger grows against {party} following controversial new government policy."
    ]
    
    neutral_templates = [
        f"{party} leaders hold internal meeting to discuss upcoming election campaign.",
        f"Political analysts debate the future strategy of {party} in {state or 'the region'}.",
        f"{party} spokesperson addresses the media regarding parliament session."
    ]
    
    all_templates = positive_templates * 2 + negative_templates * 2 + neutral_templates
    random.shuffle(all_templates)
    
    result = []
    base_date = datetime.now()
    
    for i in range(min(count, len(all_templates))):
        text = all_templates[i]
        
        pub_date = base_date - timedelta(hours=i*5)
        
        result.append({
            "title": text,
            "description": text + " This article provides an in-depth look at the political situation.",
            "content": text,
            "url": f"https://example-news.com/politics/{party.lower()}-{i}",
            "source": "Mock API Network",
            "published_at": pub_date.isoformat() + "Z",
            "party": party,
            "state": state or "All States",
            "urlToImage": f"https://picsum.photos/seed/{party}-{i}/800/450",
        })
        
    return result
