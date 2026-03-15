# pipeline/run_pipeline.py
# =====================================================
# Master runner — runs all 3 steps in sequence.
# Schedule this with Windows Task Scheduler to run
# automatically every 6 hours.
#
# Run manually:   python run_pipeline.py
# =====================================================

import os, sys, subprocess, sqlite3
from datetime import datetime

ROOT     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PIPE_DIR = os.path.join(ROOT, "pipeline")
DB_PATH  = os.path.join(PIPE_DIR, "pipeline.db")
LOG_FILE = os.path.join(PIPE_DIR, "logs", "pipeline.log")
os.makedirs(os.path.join(PIPE_DIR, "logs"), exist_ok=True)

def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

def run_step(script_name):
    script = os.path.join(PIPE_DIR, script_name)
    log(f"Running {script_name}...")
    result = subprocess.run(
        [sys.executable, script],
        capture_output=False,
        cwd=PIPE_DIR
    )
    if result.returncode != 0:
        log(f"  ERROR in {script_name} (exit code {result.returncode})")
        return False
    log(f"  {script_name} completed OK")
    return True

def get_stats():
    if not os.path.exists(DB_PATH):
        return {}
    conn  = sqlite3.connect(DB_PATH)
    stats = {
        "total":       conn.execute("SELECT COUNT(*) FROM raw_articles").fetchone()[0],
        "labeled":     conn.execute("SELECT COUNT(*) FROM raw_articles WHERE labeled=1").fetchone()[0],
        "in_pool":     conn.execute("SELECT COUNT(*) FROM raw_articles WHERE added_to_training=1").fetchone()[0],
        "trained_on":  conn.execute("SELECT COUNT(*) FROM raw_articles WHERE added_to_training=2").fetchone()[0],
    }
    conn.close()
    return stats

if __name__ == "__main__":
    log("=" * 50)
    log("PolitiSense Self-Improving Pipeline")
    log("=" * 50)

    # Run all 3 steps
    ok1 = run_step("step1_collect.py")
    ok2 = run_step("step2_label.py") if ok1 else False
    ok3 = run_step("step3_check_retrain.py") if ok2 else False

    # Print summary
    stats = get_stats()
    log("\nPipeline Summary:")
    log(f"  Total articles collected: {stats.get('total',0):,}")
    log(f"  Labeled:                  {stats.get('labeled',0):,}")
    log(f"  In training pool:         {stats.get('in_pool',0):,}")
    log(f"  Already trained on:       {stats.get('trained_on',0):,}")
    log(f"  Steps: collect={'OK' if ok1 else 'FAIL'} label={'OK' if ok2 else 'FAIL'} retrain={'OK' if ok3 else 'FAIL'}")
    log("Pipeline run complete.")