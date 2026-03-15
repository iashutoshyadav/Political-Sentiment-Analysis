# pipeline/step2_label.py
# =====================================================
# Labels all unlabeled articles in the database
# using the current production model.
# High-confidence labels (>0.85) go to training pool.
# Low-confidence labels are skipped.
#
# Run after step1:   python step2_label.py
# =====================================================

import os, sys, re, json, sqlite3, torch
import torch.nn as nn
import torch.nn.functional as F
from datetime import datetime

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH    = os.path.join(ROOT, "pipeline", "pipeline.db")
MODEL_PATH = os.path.join(ROOT, "sentiment-engine", "data", "politisense_1lakh.pt")
VOCAB_PATH = os.path.join(ROOT, "sentiment-engine", "data", "vocab_1lakh.json")

CONFIDENCE_THRESHOLD = 0.75   # only accept high-confidence labels

# ── Parties ───────────────────────────────────────────────────────────────────
PARTIES   = ["BJP","INC","AAP","SP","BSP","TMC","NCP","SS",
             "CPI(M)","JDU","RJD","TRS","TDP","YSRCP","DMK","AIADMK","BJD","JDS"]
PARTY2IDX = {p: i for i, p in enumerate(PARTIES)}
IDX2LABEL = {0: "Negative", 1: "Neutral", 2: "Positive"}

PARTY_KEYWORDS = {
    "BJP":    ["bjp","modi","amit shah","yogi","nda","bharatiya janata","jp nadda","rajnath","fadnavis","himanta"],
    "INC":    ["congress","rahul gandhi","sonia gandhi","kharge","priyanka gandhi","revanth reddy","siddaramaiah","venugopal"],
    "AAP":    ["aap","kejriwal","aam aadmi","sisodia","atishi","bhagwant mann","sanjay singh"],
    "SP":     ["samajwadi","akhilesh","mulayam","sp party","dimple yadav"],
    "BSP":    ["bahujan samaj","bsp","mayawati"],
    "TMC":    ["trinamool","tmc","mamata","banerjee","didi","abhishek banerjee"],
    "NCP":    ["ncp","sharad pawar","ajit pawar","nationalist congress","supriya sule"],
    "SS":     ["shiv sena","uddhav","eknath shinde","thackeray","sanjay raut"],
    "CPI(M)": ["cpim","cpi m","communist","left front","pinarayi","sitaram"],
    "JDU":    ["jdu","nitish kumar","janata dal united"],
    "RJD":    ["rjd","lalu","tejashwi","rashtriya janata"],
    "TRS":    ["trs","kcr","telangana rashtra","brs","ktr"],
    "TDP":    ["tdp","chandrababu","telugu desam","nara lokesh"],
    "YSRCP":  ["ysrcp","jagan","ysr congress","jaganmohan"],
    "DMK":    ["dmk","mk stalin","dravida munnetra","udhayanidhi"],
    "AIADMK": ["aiadmk","edappadi","palaniswami","jayalalithaa"],
    "BJD":    ["bjd","naveen patnaik","biju janata"],
    "JDS":    ["jds","kumaraswamy","janata dal secular","deve gowda"],
}

def detect_party(text, fallback="BJP"):
    t = text.lower()
    scores = {}
    for party, keywords in PARTY_KEYWORDS.items():
        hits = sum(1 for kw in keywords if kw in t)
        if hits > 0:
            scores[party] = hits
    return max(scores, key=scores.get) if scores else fallback

# ── Model ─────────────────────────────────────────────────────────────────────
class MultiHeadAttention(nn.Module):
    def __init__(self, dim, heads=4):
        super().__init__()
        self.heads = heads; self.hd = dim // heads
        self.q = nn.Linear(dim, dim); self.k = nn.Linear(dim, dim)
        self.v = nn.Linear(dim, dim); self.o = nn.Linear(dim, dim)
    def forward(self, x, mask=None):
        B,T,D = x.shape; H,Hd = self.heads, self.hd
        Q = self.q(x).view(B,T,H,Hd).transpose(1,2)
        K = self.k(x).view(B,T,H,Hd).transpose(1,2)
        V = self.v(x).view(B,T,H,Hd).transpose(1,2)
        attn = torch.matmul(Q, K.transpose(-2,-1)) * (Hd**-0.5)
        if mask is not None: attn = attn.masked_fill(mask[:,None,None,:], -1e9)
        attn = F.softmax(attn, dim=-1)
        return self.o(torch.matmul(attn, V).transpose(1,2).contiguous().view(B,T,D))

class PolitiModel(nn.Module):
    def __init__(self, vocab_size, num_parties=18, embed_dim=160,
                 party_dim=32, hidden_dim=384, num_layers=3, num_heads=4, dropout=0.5, **kw):
        super().__init__()
        self.embed   = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.p_embed = nn.Embedding(num_parties, party_dim)
        self.lstm    = nn.LSTM(embed_dim, hidden_dim, num_layers=num_layers,
                               batch_first=True, bidirectional=True,
                               dropout=dropout if num_layers > 1 else 0.0)
        self.attn    = MultiHeadAttention(hidden_dim*2, num_heads)
        self.norm    = nn.LayerNorm(hidden_dim*2)
        self.drop    = nn.Dropout(dropout)
        in_dim = hidden_dim*2*3 + party_dim
        self.fc1 = nn.Linear(in_dim, 256); self.fc2 = nn.Linear(256, 128); self.fc3 = nn.Linear(128, 3)
        self.bn1 = nn.BatchNorm1d(256); self.bn2 = nn.BatchNorm1d(128)
    def forward(self, tok, party):
        mask = (tok == 0); x = self.drop(self.embed(tok))
        lstm_out, _ = self.lstm(x)
        attn_out    = self.attn(lstm_out, mask)
        attn_out    = self.norm(lstm_out + attn_out)
        mf          = (~mask).float().unsqueeze(-1)
        mean_p      = (attn_out * mf).sum(1) / mf.sum(1).clamp(min=1)
        max_p       = attn_out.masked_fill(mask.unsqueeze(-1), -1e9).max(1).values
        cls_p       = attn_out[:, 0, :]
        pv          = self.p_embed(party)
        x           = torch.cat([cls_p, mean_p, max_p, pv], dim=-1)
        x           = self.drop(x)
        x           = self.drop(F.relu(self.bn1(self.fc1(x))))
        x           = self.drop(F.relu(self.bn2(self.fc2(x))))
        return self.fc3(x)

# ── Helpers ───────────────────────────────────────────────────────────────────
def clean(text):
    text = re.sub(r"[^a-z0-9\s]", " ", str(text).lower())
    tokens = text.split()
    bigrams = [f"{tokens[i]}_{tokens[i+1]}" for i in range(len(tokens)-1)]
    return tokens + bigrams

def encode(text, vocab, max_len=80):
    toks = clean(text)[:max_len]
    ids  = [vocab.get(t, 1) for t in toks]
    ids += [0] * (max_len - len(ids))
    return ids

def load_model():
    print("Loading model...")
    ckpt  = torch.load(MODEL_PATH, map_location="cpu", weights_only=True)
    with open(VOCAB_PATH) as f: vocab = json.load(f)
    cfg   = ckpt["config"]
    model = PolitiModel(vocab_size=ckpt["vocab_size"], **cfg)
    model.load_state_dict(ckpt["model_state"])
    model.eval()
    print(f"  Model loaded (F1={ckpt.get('best_f1',0):.4f}  vocab={len(vocab):,})")
    return model, vocab, cfg.get("max_len", 80)

def predict(text, party, model, vocab, max_len):
    token_ids = torch.tensor([encode(text, vocab, max_len)], dtype=torch.long)
    party_id  = torch.tensor([PARTY2IDX.get(party, 0)], dtype=torch.long)
    with torch.no_grad():
        probs = F.softmax(model(token_ids, party_id), dim=-1)[0]
        pred  = probs.argmax().item()
    return IDX2LABEL[pred], float(probs[2]-probs[0]), float(probs[pred])

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 55)
    print("  Step 2: Auto-labeling unlabeled articles")
    print("=" * 55)

    model, vocab, max_len = load_model()

    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT id, title, description FROM raw_articles WHERE labeled=0"
    ).fetchall()
    print(f"\n  Unlabeled articles: {len(rows)}")

    labeled        = 0
    high_conf      = 0
    low_conf       = 0

    for row_id, title, desc in rows:
        text  = f"{title} {desc or ''}".strip()
        party = detect_party(text)

        label, score, confidence = predict(text, party, model, vocab, max_len)

        # Mark as labeled always
        accepted = 1 if confidence >= CONFIDENCE_THRESHOLD else 0

        conn.execute("""
            UPDATE raw_articles
            SET labeled=1, label=?, score=?, confidence=?, party=?,
                added_to_training=?
            WHERE id=?
        """, (label, round(score,4), round(confidence,4), party, accepted, row_id))

        labeled += 1
        if accepted: high_conf += 1
        else:        low_conf  += 1

        if labeled % 100 == 0:
            conn.commit()
            print(f"  Labeled {labeled}/{len(rows)}...")

    conn.commit()

    # Summary
    total_training = conn.execute(
        "SELECT COUNT(*) FROM raw_articles WHERE added_to_training=1"
    ).fetchone()[0]

    conn.execute("INSERT INTO pipeline_log (event, details) VALUES (?,?)", (
        "LABEL",
        f"labeled={labeled} high_conf={high_conf} low_conf={low_conf} total_training_pool={total_training}"
    ))
    conn.commit()
    conn.close()

    print(f"\n{'='*55}")
    print(f"  Labeled this run:      {labeled}")
    print(f"  High confidence (>0.85): {high_conf} → added to training pool")
    print(f"  Low confidence:          {low_conf} → skipped")
    print(f"  Total training pool:     {total_training}")
    print(f"\n  Next: run step3_check_retrain.py")
    print(f"{'='*55}")