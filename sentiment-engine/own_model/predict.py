# sentiment-engine/own_model/predict.py
# Updated to match the NEW upgraded model architecture
# (Multi-Head Attention + 3-layer BiLSTM + BatchNorm)

import torch
import torch.nn as nn
import torch.nn.functional as F
import json, re, os

PARTIES = [
    "BJP","INC","AAP","SP","BSP","TMC","NCP","SS",
    "CPI(M)","JDU","RJD","TRS","TDP","YSRCP",
    "DMK","AIADMK","BJD","JDS"
]
PARTY2IDX = {p: i for i, p in enumerate(PARTIES)}
IDX2LABEL = {0: "Negative", 1: "Neutral", 2: "Positive"}

BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "data", "politisense_1lakh.pt")
VOCAB_PATH = os.path.join(BASE_DIR, "data", "vocab_1lakh.json")


def clean(text):
    text   = re.sub(r"[^a-z0-9\s]", " ", str(text).lower())
    tokens = text.split()
    bigrams = [f"{tokens[i]}_{tokens[i+1]}" for i in range(len(tokens)-1)]
    return tokens + bigrams


def encode(text, token2idx, max_len=80):
    tokens = clean(text)[:max_len]
    ids    = [token2idx.get(t, 1) for t in tokens]
    ids   += [0] * (max_len - len(ids))
    return ids


# ── NEW upgraded model architecture ──────────────────────────────────────────
class MultiHeadAttention(nn.Module):
    def __init__(self, dim, heads=4):
        super().__init__()
        self.heads = heads
        self.hd    = dim // heads
        self.q = nn.Linear(dim, dim)
        self.k = nn.Linear(dim, dim)
        self.v = nn.Linear(dim, dim)
        self.o = nn.Linear(dim, dim)

    def forward(self, x, mask=None):
        B, T, D = x.shape
        H, Hd   = self.heads, self.hd
        Q = self.q(x).view(B,T,H,Hd).transpose(1,2)
        K = self.k(x).view(B,T,H,Hd).transpose(1,2)
        V = self.v(x).view(B,T,H,Hd).transpose(1,2)
        attn = torch.matmul(Q, K.transpose(-2,-1)) * (Hd**-0.5)
        if mask is not None:
            attn = attn.masked_fill(mask[:,None,None,:], -1e9)
        attn = F.softmax(attn, dim=-1)
        out  = torch.matmul(attn, V).transpose(1,2).contiguous().view(B,T,D)
        return self.o(out)


class PolitiSentimentModel(nn.Module):
    def __init__(self, vocab_size, num_parties=18, embed_dim=160,
                 party_dim=32, hidden_dim=384, num_layers=3,
                 num_heads=4, dropout=0.5, **kw):
        super().__init__()
        self.embed   = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.p_embed = nn.Embedding(num_parties, party_dim)
        self.lstm    = nn.LSTM(embed_dim, hidden_dim, num_layers=num_layers,
                               batch_first=True, bidirectional=True,
                               dropout=dropout if num_layers > 1 else 0.0)
        self.attn    = MultiHeadAttention(hidden_dim*2, num_heads)
        self.norm    = nn.LayerNorm(hidden_dim*2)
        self.drop    = nn.Dropout(dropout)
        in_dim       = hidden_dim*2*3 + party_dim
        self.fc1     = nn.Linear(in_dim, 256)
        self.fc2     = nn.Linear(256, 128)
        self.fc3     = nn.Linear(128, 3)
        self.bn1     = nn.BatchNorm1d(256)
        self.bn2     = nn.BatchNorm1d(128)

    def forward(self, tok, party):
        mask        = (tok == 0)
        x           = self.drop(self.embed(tok))
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


# ── Lazy load ─────────────────────────────────────────────────────────────────
_model, _vocab, _max_len = None, None, 80


def _load():
    global _model, _vocab, _max_len
    ckpt = torch.load(MODEL_PATH, map_location="cpu", weights_only=True)
    with open(VOCAB_PATH) as f:
        _vocab = json.load(f)
    cfg      = ckpt["config"]
    _max_len = cfg.get("max_len", 80)
    _model   = PolitiSentimentModel(
        vocab_size  = ckpt["vocab_size"],
        num_parties = ckpt.get("num_parties", 18),
        embed_dim   = cfg["embed_dim"],
        party_dim   = cfg["party_dim"],
        hidden_dim  = cfg["hidden_dim"],
        num_layers  = cfg["num_layers"],
        num_heads   = cfg.get("num_heads", 4),
        dropout     = cfg["dropout"],
    )
    _model.load_state_dict(ckpt["model_state"])
    _model.eval()
    best_f1 = ckpt.get("best_f1", 0)
    print(f"PolitiSense model loaded  (F1={best_f1:.4f}  vocab={len(_vocab):,})")


def predict(text: str, party: str) -> dict:
    if _model is None:
        _load()

    token_ids = torch.tensor([encode(text, _vocab, _max_len)], dtype=torch.long)
    party_id  = torch.tensor([PARTY2IDX.get(party, 0)],        dtype=torch.long)

    _model.eval()
    with torch.no_grad():
        probs = F.softmax(_model(token_ids, party_id), dim=-1)[0]
        pred  = probs.argmax().item()

    score = float(probs[2] - probs[0])
    return {
        "label":      IDX2LABEL[pred],
        "score":      round(score, 4),
        "confidence": round(float(probs[pred]), 4),
        "probs": {
            "Negative": round(float(probs[0]), 4),
            "Neutral":  round(float(probs[1]), 4),
            "Positive": round(float(probs[2]), 4),
        }
    }


def predict_batch(texts: list, party: str) -> list:
    return [predict(t, party) for t in texts]


if __name__ == "__main__":
    tests = [
        ("BJP wins massive majority in Uttar Pradesh elections", "BJP"),
        ("BJP wins massive majority in Uttar Pradesh elections", "INC"),
        ("Congress leader arrested in corruption scandal",       "INC"),
        ("Kejriwal arrested by ED in liquor policy case",        "AAP"),
        ("AAP opens 500 new mohalla clinics across Delhi",       "AAP"),
        ("SP wins landslide in Uttar Pradesh bypolls",           "SP"),
        ("Mamata Banerjee wins Bengal trust vote",               "TMC"),
        ("CBI raids TMC leader home in coal scam probe",         "TMC"),
    ]
    print(f"\n{'Headline':<55} {'Party':<8} {'Label':<10} {'Score':>6}  {'Conf'}")
    print("-" * 90)
    for text, party in tests:
        r = predict(text, party)
        print(f"{text[:54]:<55} {party:<8} {r['label']:<10} {r['score']:>6.3f}  {r['confidence']:>5.3f}")