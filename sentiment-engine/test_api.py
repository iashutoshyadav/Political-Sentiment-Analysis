# test_api.py
# Run this WHILE your backend is running:
#   cd backend && uvicorn app.main:app --reload --port 8000
#   (in a second terminal) python test_api.py

import requests

BASE = "http://localhost:8000"

print("=" * 60)
print("  PolitiSense API Test")
print("=" * 60)

# ── Test 1: health check ──────────────────────────────────────
print("\n[1] Checking server is up...")
try:
    r = requests.get(f"{BASE}/docs", timeout=5)
    print(f"    ✓ Server running  (status {r.status_code})")
except Exception as e:
    print(f"    ✗ Server not reachable: {e}")
    print("    Make sure backend is running first!")
    exit(1)

# ── Test 2: sentiment endpoint ────────────────────────────────
print("\n[2] Testing sentiment analysis...")

test_cases = [
    {"text": "BJP wins massive majority in Uttar Pradesh elections", "party": "BJP"},
    {"text": "BJP wins massive majority in Uttar Pradesh elections", "party": "INC"},
    {"text": "Kejriwal arrested by ED in liquor policy case",        "party": "AAP"},
    {"text": "Parliament session begins today",                      "party": "BJP"},
]

for tc in test_cases:
    try:
        r = requests.post(f"{BASE}/sentiment/analyze", json=tc, timeout=10)
        if r.status_code == 200:
            data = r.json()
            print(f"\n    Headline : {tc['text'][:50]}")
            print(f"    Party    : {tc['party']}")
            print(f"    Label    : {data.get('label') or data.get('sentiment_label')}")
            print(f"    Score    : {data.get('score') or data.get('sentiment_score')}")
            print(f"    Model    : {data.get('model', 'not returned')}")
            print(f"    Status   : ✓ OK")
        else:
            print(f"    ✗ HTTP {r.status_code}: {r.text[:100]}")
    except Exception as e:
        print(f"    ✗ Error: {e}")

# ── Test 3: check model field in response ─────────────────────
print("\n[3] Verifying model version in response...")
r = requests.post(f"{BASE}/sentiment/analyze",
                  json={"text": "BJP wins election", "party": "BJP"})
data = r.json()
model_field = data.get("model", "NOT PRESENT")
if "bilstm" in str(model_field).lower() or "politisense" in str(model_field).lower():
    print(f"    ✓ Using trained model: {model_field}")
elif model_field == "vader-textblob-fallback":
    print(f"    ⚠ Using fallback model — check that .pt and vocab.json are in sentiment-engine/data/")
else:
    print(f"    ~ model field: {model_field}")

print("\n" + "=" * 60)
print("  Done!")
print("=" * 60)