# pipeline/step3_check_retrain.py
# =====================================================
# Checks if enough new data has accumulated.
# If yes, retrains the model and compares with current.
# If new model is better → deploys it automatically.
#
# Run after step2:   python step3_check_retrain.py
# =====================================================

import os, sys, re, json, sqlite3, math, random
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
from datetime import datetime
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from sklearn.metrics import accuracy_score, f1_score, classification_report
from collections import Counter
import shutil

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT            = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH         = os.path.join(ROOT, "pipeline", "pipeline.db")
DATA_DIR        = os.path.join(ROOT, "sentiment-engine", "data")
CURRENT_MODEL   = os.path.join(DATA_DIR, "politisense_1lakh.pt")
CURRENT_VOCAB   = os.path.join(DATA_DIR, "vocab_1lakh.json")
NEW_MODEL       = os.path.join(DATA_DIR, "politisense_new.pt")
NEW_VOCAB       = os.path.join(DATA_DIR, "vocab_new.json")
BACKUP_MODEL    = os.path.join(DATA_DIR, "politisense_backup.pt")
HISTORY_CSV     = os.path.join(ROOT, "pipeline", "retrain_history.csv")

RETRAIN_THRESHOLD = 5000   # retrain every N new high-confidence samples
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ── Model (same as step2) ─────────────────────────────────────────────────────
PARTIES   = ["BJP","INC","AAP","SP","BSP","TMC","NCP","SS",
             "CPI(M)","JDU","RJD","TRS","TDP","YSRCP","DMK","AIADMK","BJD","JDS"]
PARTY2IDX = {p: i for i, p in enumerate(PARTIES)}
LABEL_MAP = {"Negative": 0, "Neutral": 1, "Positive": 2}
IDX2LABEL = {0: "Negative", 1: "Neutral", 2: "Positive"}

class MultiHeadAttention(nn.Module):
    def __init__(self, dim, heads=4):
        super().__init__()
        self.heads=heads; self.hd=dim//heads
        self.q=nn.Linear(dim,dim); self.k=nn.Linear(dim,dim)
        self.v=nn.Linear(dim,dim); self.o=nn.Linear(dim,dim)
    def forward(self, x, mask=None):
        B,T,D=x.shape; H,Hd=self.heads,self.hd
        Q=self.q(x).view(B,T,H,Hd).transpose(1,2)
        K=self.k(x).view(B,T,H,Hd).transpose(1,2)
        V=self.v(x).view(B,T,H,Hd).transpose(1,2)
        attn=torch.matmul(Q,K.transpose(-2,-1))*(Hd**-0.5)
        if mask is not None: attn=attn.masked_fill(mask[:,None,None,:],-1e9)
        attn=F.softmax(attn,dim=-1)
        return self.o(torch.matmul(attn,V).transpose(1,2).contiguous().view(B,T,D))

class PolitiModel(nn.Module):
    def __init__(self, vocab_size, num_parties=18, embed_dim=160,
                 party_dim=32, hidden_dim=384, num_layers=3, num_heads=4, dropout=0.5, **kw):
        super().__init__()
        self.embed=nn.Embedding(vocab_size,embed_dim,padding_idx=0)
        self.p_embed=nn.Embedding(num_parties,party_dim)
        self.lstm=nn.LSTM(embed_dim,hidden_dim,num_layers=num_layers,
                          batch_first=True,bidirectional=True,
                          dropout=dropout if num_layers>1 else 0.0)
        self.attn=MultiHeadAttention(hidden_dim*2,num_heads)
        self.norm=nn.LayerNorm(hidden_dim*2)
        self.drop=nn.Dropout(dropout)
        in_dim=hidden_dim*2*3+party_dim
        self.fc1=nn.Linear(in_dim,256); self.fc2=nn.Linear(256,128); self.fc3=nn.Linear(128,3)
        self.bn1=nn.BatchNorm1d(256); self.bn2=nn.BatchNorm1d(128)
    def forward(self, tok, party):
        mask=(tok==0); x=self.drop(self.embed(tok))
        lo,_=self.lstm(x); ao=self.attn(lo,mask); ao=self.norm(lo+ao)
        mf=(~mask).float().unsqueeze(-1)
        mp=(ao*mf).sum(1)/mf.sum(1).clamp(min=1)
        xp=ao.masked_fill(mask.unsqueeze(-1),-1e9).max(1).values
        cp=ao[:,0,:]; pv=self.p_embed(party)
        x=torch.cat([cp,mp,xp,pv],dim=-1); x=self.drop(x)
        x=self.drop(F.relu(self.bn1(self.fc1(x))))
        x=self.drop(F.relu(self.bn2(self.fc2(x))))
        return self.fc3(x)

# ── Helpers ───────────────────────────────────────────────────────────────────
def clean(text):
    text=re.sub(r"[^a-z0-9\s]"," ",str(text).lower())
    toks=text.split()
    return toks+[f"{toks[i]}_{toks[i+1]}" for i in range(len(toks)-1)]

class PolitiVocab:
    def __init__(self, min_freq=2):
        self.token2idx={"<PAD>":0,"<UNK>":1}
        self.min_freq=min_freq
    def build(self, texts):
        ctr=Counter()
        for t in texts: ctr.update(clean(t))
        for tok,f in ctr.items():
            if f>=self.min_freq: self.token2idx[tok]=len(self.token2idx)
    def encode(self, text, max_len=80):
        toks=clean(text)[:max_len]
        ids=[self.token2idx.get(t,1) for t in toks]
        ids+=[0]*(max_len-len(ids))
        return ids
    def save(self, path):
        with open(path,"w") as f: json.dump(self.token2idx,f)
    def __len__(self): return len(self.token2idx)

class PolitiDS(Dataset):
    def __init__(self, df, vocab, max_len=80, augment=False):
        self.texts=[str(t) for t in df["text"].tolist()]
        self.pids=[PARTY2IDX.get(str(p),0) for p in df["party"].tolist()]
        self.labels=[LABEL_MAP[l] for l in df["label"].tolist()]
        self.vocab=vocab; self.max_len=max_len; self.augment=augment
    def __len__(self): return len(self.texts)
    def _aug(self, text):
        w=text.split()
        if len(w)<4: return text
        w=[x for x in w if random.random()>0.1]
        return " ".join(w) if w else text
    def __getitem__(self, idx):
        t=self.texts[idx]
        if self.augment and random.random()<0.4: t=self._aug(t)
        return (torch.tensor(self.vocab.encode(t,self.max_len),dtype=torch.long),
                torch.tensor(self.pids[idx],dtype=torch.long),
                torch.tensor(self.labels[idx],dtype=torch.long))

def get_lr(epoch, total, warmup=3, base=3e-3, min_lr=1e-5):
    if epoch<warmup: return base*(epoch+1)/warmup
    p=(epoch-warmup)/max(1,total-warmup)
    return min_lr+0.5*(base-min_lr)*(1+math.cos(math.pi*p))

def evaluate(model, loader):
    model.eval(); preds,trues=[],[]
    with torch.no_grad():
        for tok,party,labels in loader:
            tok,party=tok.to(DEVICE),party.to(DEVICE)
            logits=model(tok,party)
            preds.extend(logits.argmax(-1).cpu().tolist())
            trues.extend(labels.tolist())
    return accuracy_score(trues,preds), f1_score(trues,preds,average="macro")

def load_current_f1():
    if not os.path.exists(CURRENT_MODEL): return 0.0
    ckpt=torch.load(CURRENT_MODEL,map_location="cpu",weights_only=True)
    return ckpt.get("best_f1",0.0)

def log_retrain(new_f1, old_f1, new_data, total_data, deployed):
    row = {
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "new_f1": round(new_f1,4), "old_f1": round(old_f1,4),
        "new_samples": new_data, "total_samples": total_data,
        "deployed": deployed,
    }
    if os.path.exists(HISTORY_CSV):
        df=pd.read_csv(HISTORY_CSV)
        df=pd.concat([df,pd.DataFrame([row])],ignore_index=True)
    else:
        df=pd.DataFrame([row])
    df.to_csv(HISTORY_CSV,index=False)

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("="*55)
    print("  Step 3: Check retrain trigger")
    print("="*55)

    conn = sqlite3.connect(DB_PATH)

    # Count new high-confidence samples since last retrain
    new_count = conn.execute(
        "SELECT COUNT(*) FROM raw_articles WHERE added_to_training=1 AND labeled=1"
    ).fetchone()[0]

    print(f"\n  High-confidence samples in pool: {new_count}")
    print(f"  Retrain threshold:               {RETRAIN_THRESHOLD}")

    if new_count < RETRAIN_THRESHOLD:
        needed = RETRAIN_THRESHOLD - new_count
        print(f"\n  Not enough data yet. Need {needed} more samples.")
        print(f"  Keep running step1+step2 daily until threshold is reached.")
        conn.close()
        sys.exit(0)

    print(f"\n  Threshold reached! Starting retrain...")

    # Load all training data: existing CSV + new pipeline data
    rows = conn.execute(
        "SELECT title, description, party, label FROM raw_articles WHERE added_to_training=1"
    ).fetchall()
    conn.close()

    new_df = pd.DataFrame(rows, columns=["title","description","party","label"])
    new_df["text"] = new_df["title"] + " " + new_df["description"].fillna("")

    # Load existing training data
    existing_csvs = [
        os.path.join(ROOT, "politisense-model", "data", "train_1lakh_final.csv"),
        os.path.join(DATA_DIR, "train_1lakh_final.csv"),
    ]
    existing_parts = [new_df[["text","party","label"]]]
    for path in existing_csvs:
        if os.path.exists(path):
            df = pd.read_csv(path)
            if all(c in df.columns for c in ["text","party","label"]):
                existing_parts.append(df[["text","party","label"]])
                print(f"  Loaded existing: {path} ({len(df):,} rows)")

    combined = pd.concat(existing_parts, ignore_index=True)
    combined = combined.dropna()
    combined = combined[combined["label"].isin(["Positive","Negative","Neutral"])]
    combined = combined[combined["party"].isin(PARTIES)]
    combined = combined.drop_duplicates(subset=["text","party"])
    combined = combined.sample(frac=1, random_state=42).reset_index(drop=True)

    print(f"\n  Combined dataset: {len(combined):,} rows")
    print(f"  Label distribution:")
    print(combined["label"].value_counts().to_string())

    # Build vocab
    vocab = PolitiVocab(min_freq=2)
    vocab.build(combined["text"].tolist())
    print(f"\n  Vocabulary: {len(vocab):,} tokens")

    # Split
    val_size   = int(len(combined)*0.2)
    train_df   = combined.iloc[val_size:]
    val_df     = combined.iloc[:val_size]

    train_ds = PolitiDS(train_df, vocab, augment=True)
    val_ds   = PolitiDS(val_df,   vocab, augment=False)

    lc = Counter(train_ds.labels)
    weights = [1.0/lc[l] for l in train_ds.labels]
    sampler = WeightedRandomSampler(weights, len(weights), replacement=True)

    train_loader = DataLoader(train_ds, batch_size=128, sampler=sampler, num_workers=0)
    val_loader   = DataLoader(val_ds,   batch_size=128, shuffle=False,   num_workers=0)

    # Train
    model     = PolitiModel(vocab_size=len(vocab)).to(DEVICE)
    optimizer = torch.optim.AdamW(model.parameters(), lr=3e-3, weight_decay=1e-3)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)

    best_f1    = 0.0
    patience   = 0
    EPOCHS     = 30
    PATIENCE   = 6

    print(f"\n  Training on {DEVICE}...")
    print("="*55)

    for epoch in range(EPOCHS):
        lr = get_lr(epoch, EPOCHS)
        for pg in optimizer.param_groups: pg["lr"] = lr

        model.train()
        for tok,party,labels in train_loader:
            tok,party,labels=tok.to(DEVICE),party.to(DEVICE),labels.to(DEVICE)
            logits=model(tok,party)
            loss=criterion(logits,labels)
            optimizer.zero_grad(); loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(),1.0)
            optimizer.step()

        acc, f1 = evaluate(model, val_loader)
        saved = ""
        if f1 > best_f1:
            best_f1 = f1; patience = 0; saved = " <- BEST"
            torch.save({
                "model_state": model.state_dict(),
                "vocab_size":  len(vocab),
                "num_parties": len(PARTIES),
                "best_f1":     best_f1,
                "trained_on":  len(combined),
                "date":        datetime.now().isoformat(),
                "config": {"embed_dim":160,"party_dim":32,"hidden_dim":384,
                           "num_layers":3,"num_heads":4,"dropout":0.5,"max_len":80}
            }, NEW_MODEL)
            vocab.save(NEW_VOCAB)
        else:
            patience += 1

        print(f"  Epoch {epoch+1:02d} | acc: {acc:.4f} | f1: {f1:.4f} | lr: {lr:.2e}{saved}")
        if patience >= PATIENCE:
            print(f"  Early stopping at epoch {epoch+1}")
            break

    print("="*55)
    print(f"  New model F1: {best_f1:.4f}")

    # Compare with current model
    old_f1 = load_current_f1()
    print(f"  Current model F1: {old_f1:.4f}")

    deployed = False
    if best_f1 > old_f1:
        print(f"\n  New model is BETTER (+{best_f1-old_f1:.4f}) — deploying!")
        # Backup current
        if os.path.exists(CURRENT_MODEL):
            shutil.copy2(CURRENT_MODEL, BACKUP_MODEL)
            print(f"  Backed up current model to politisense_backup.pt")
        # Deploy new
        shutil.copy2(NEW_MODEL, CURRENT_MODEL)
        shutil.copy2(NEW_VOCAB, CURRENT_VOCAB)
        print(f"  New model deployed as politisense_1lakh.pt")
        deployed = True
    else:
        print(f"\n  New model is NOT better — keeping current model")
        print(f"  New model saved as politisense_new.pt for review")

    log_retrain(best_f1, old_f1, new_count, len(combined), deployed)

    # Mark retraining done — reset counter
    conn = sqlite3.connect(DB_PATH)
    conn.execute("INSERT INTO pipeline_log (event,details) VALUES (?,?)", (
        "RETRAIN",
        f"new_f1={best_f1:.4f} old_f1={old_f1:.4f} deployed={deployed} samples={len(combined)}"
    ))
    if deployed:
        conn.execute("UPDATE raw_articles SET added_to_training=2 WHERE added_to_training=1")
    conn.commit()
    conn.close()

    print(f"\n{'='*55}")
    print(f"  Retrain complete!")
    print(f"  New F1:    {best_f1:.4f}")
    print(f"  Old F1:    {old_f1:.4f}")
    print(f"  Deployed:  {deployed}")
    print(f"{'='*55}")