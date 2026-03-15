# pipeline/setup_scheduler.py
# =====================================================
# Sets up Windows Task Scheduler to run the pipeline
# automatically every 6 hours.
#
# Run ONCE as Administrator:
#   python setup_scheduler.py
# =====================================================

import os, sys, subprocess

ROOT       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PIPE_DIR   = os.path.join(ROOT, "pipeline")
RUNNER     = os.path.join(PIPE_DIR, "run_pipeline.py")
PYTHON_EXE = sys.executable
TASK_NAME  = "PolitiSense_Pipeline"

def setup_windows_scheduler():
    """Create Windows Task Scheduler task to run pipeline every 6 hours."""
    xml = f"""<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>PolitiSense self-improving pipeline — runs every 6 hours</Description>
  </RegistrationInfo>
  <Triggers>
    <CalendarTrigger>
      <Repetition>
        <Interval>PT6H</Interval>
        <StopAtDurationEnd>false</StopAtDurationEnd>
      </Repetition>
      <StartBoundary>2026-01-01T06:00:00</StartBoundary>
      <Enabled>true</Enabled>
      <ScheduleByDay>
        <DaysInterval>1</DaysInterval>
      </ScheduleByDay>
    </CalendarTrigger>
  </Triggers>
  <Actions Context="Author">
    <Exec>
      <Command>{PYTHON_EXE}</Command>
      <Arguments>"{RUNNER}"</Arguments>
      <WorkingDirectory>{PIPE_DIR}</WorkingDirectory>
    </Exec>
  </Actions>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <ExecutionTimeLimit>PT2H</ExecutionTimeLimit>
    <Enabled>true</Enabled>
  </Settings>
</Task>"""

    xml_path = os.path.join(PIPE_DIR, "task.xml")
    with open(xml_path, "w", encoding="utf-16") as f:
        f.write(xml)

    result = subprocess.run(
        ["schtasks", "/create", "/tn", TASK_NAME, "/xml", xml_path, "/f"],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        print(f"Task '{TASK_NAME}' created successfully!")
        print("Pipeline will run every 6 hours automatically.")
    else:
        print(f"Failed to create task: {result.stderr}")
        print("Try running as Administrator.")

    os.remove(xml_path)


def show_status():
    """Show current pipeline status."""
    import sqlite3, pandas as pd

    DB_PATH = os.path.join(PIPE_DIR, "pipeline.db")
    if not os.path.exists(DB_PATH):
        print("No database found. Run step1_collect.py first.")
        return

    conn  = sqlite3.connect(DB_PATH)
    print("\n" + "="*55)
    print("  PolitiSense Pipeline Status")
    print("="*55)

    total   = conn.execute("SELECT COUNT(*) FROM raw_articles").fetchone()[0]
    labeled = conn.execute("SELECT COUNT(*) FROM raw_articles WHERE labeled=1").fetchone()[0]
    in_pool = conn.execute("SELECT COUNT(*) FROM raw_articles WHERE added_to_training=1").fetchone()[0]
    trained = conn.execute("SELECT COUNT(*) FROM raw_articles WHERE added_to_training=2").fetchone()[0]

    print(f"  Articles collected:    {total:,}")
    print(f"  Articles labeled:      {labeled:,}")
    print(f"  In training pool:      {in_pool:,}  (need 5,000 to retrain)")
    print(f"  Already trained on:    {trained:,}")
    print(f"  Progress to retrain:   {min(100, in_pool*100//5000)}%")

    print("\n  Label distribution in pool:")
    rows = conn.execute(
        "SELECT label, COUNT(*) FROM raw_articles WHERE added_to_training=1 GROUP BY label"
    ).fetchall()
    for label, count in rows:
        print(f"    {label:<12} {count:>6,}")

    print("\n  Recent pipeline events:")
    rows = conn.execute(
        "SELECT event, details, created_at FROM pipeline_log ORDER BY id DESC LIMIT 10"
    ).fetchall()
    for event, details, ts in rows:
        print(f"    [{ts[:16]}] {event}: {details}")

    # Retrain history
    HISTORY = os.path.join(PIPE_DIR, "retrain_history.csv")
    if os.path.exists(HISTORY):
        df = pd.read_csv(HISTORY)
        print(f"\n  Retrain history ({len(df)} runs):")
        print(df.tail(5).to_string(index=False))

    conn.close()
    print("="*55)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--setup",  action="store_true", help="Set up Windows Task Scheduler")
    parser.add_argument("--status", action="store_true", help="Show pipeline status")
    args = parser.parse_args()

    if args.setup:
        setup_windows_scheduler()
    elif args.status:
        show_status()
    else:
        print("Usage:")
        print("  python setup_scheduler.py --setup    # schedule automatic runs")
        print("  python setup_scheduler.py --status   # show current status")