# test_accuracy.py
# Full benchmark — tests all 18 parties with positive/negative/neutral cases
# Run from sentiment-engine/:
#   python test_accuracy.py

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "own_model"))
from predict import predict

# 18 parties × 3 labels = 54 test cases
ALL_TESTS = [
    # BJP
    ("BJP wins massive majority in state elections",               "BJP",  "Positive"),
    ("BJP leader arrested in corruption and bribery case",         "BJP",  "Negative"),
    ("BJP holds national executive meeting in Delhi",              "BJP",  "Neutral"),
    # INC
    ("Congress wins crucial bypolls defeating ruling party",       "INC",  "Positive"),
    ("Congress leader faces ED probe in money laundering case",    "INC",  "Negative"),
    ("Congress holds press conference on inflation",               "INC",  "Neutral"),
    # AAP
    ("AAP wins Delhi assembly elections with huge majority",       "AAP",  "Positive"),
    ("Kejriwal arrested by ED in liquor policy scandal",           "AAP",  "Negative"),
    ("AAP announces free electricity scheme review",               "AAP",  "Neutral"),
    # SP
    ("SP wins landslide victory in Uttar Pradesh bypolls",         "SP",   "Positive"),
    ("SP leader booked in criminal case in Lucknow",               "SP",   "Negative"),
    ("SP holds rally in Varanasi ahead of elections",              "SP",   "Neutral"),
    # BSP
    ("BSP wins key seats in UP panchayat elections",               "BSP",  "Positive"),
    ("BSP leader expelled from party amid corruption charges",     "BSP",  "Negative"),
    ("BSP holds convention in Lucknow",                            "BSP",  "Neutral"),
    # TMC
    ("TMC wins Bengal trust vote with comfortable majority",       "TMC",  "Positive"),
    ("CBI raids TMC leader home in coal scam investigation",       "TMC",  "Negative"),
    ("TMC holds mega rally in Kolkata",                            "TMC",  "Neutral"),
    # NCP
    ("NCP wins crucial Maharashtra assembly seat",                 "NCP",  "Positive"),
    ("NCP leader faces money laundering charges",                  "NCP",  "Negative"),
    ("NCP holds meeting on Maharashtra government formation",      "NCP",  "Neutral"),
    # SS (Shiv Sena)
    ("Shiv Sena wins Mumbai municipal corporation polls",          "SS",   "Positive"),
    ("SS leader arrested in corruption and extortion case",        "SS",   "Negative"),
    ("Shiv Sena holds Dussehra rally at Shivaji Park",             "SS",   "Neutral"),
    # CPI(M)
    ("CPI M wins Kerala local body elections with majority",       "CPI(M)","Positive"),
    ("CPI M leader arrested in political violence case Kerala",    "CPI(M)","Negative"),
    ("CPI M holds politburo meeting in Delhi",                     "CPI(M)","Neutral"),
    # JDU
    ("JDU wins Bihar bypolls strengthening Nitish Kumar",          "JDU",  "Positive"),
    ("JDU leader faces corruption allegations in Bihar",           "JDU",  "Negative"),
    ("JDU holds national council meeting in Patna",                "JDU",  "Neutral"),
    # RJD
    ("RJD wins Bihar assembly seats in landslide victory",         "RJD",  "Positive"),
    ("RJD leader convicted in fodder scam case Bihar court",       "RJD",  "Negative"),
    ("RJD holds mahagathbandhan rally in Patna",                   "RJD",  "Neutral"),
    # TRS / BRS
    ("TRS wins Telangana bypolls with thumping majority",          "TRS",  "Positive"),
    ("TRS leader arrested in phone tapping scandal case",          "TRS",  "Negative"),
    ("TRS holds plenary session in Hyderabad",                     "TRS",  "Neutral"),
    # TDP
    ("TDP wins Andhra Pradesh local body elections",               "TDP",  "Positive"),
    ("TDP leader faces corruption charges in irrigation scam",     "TDP",  "Negative"),
    ("TDP holds national executive meeting in Amaravati",          "TDP",  "Neutral"),
    # YSRCP
    ("YSRCP wins Andhra Pradesh bypolls with huge margin",         "YSRCP","Positive"),
    ("YSRCP leader arrested in sand mining corruption case",       "YSRCP","Negative"),
    ("YSRCP holds review meeting on welfare schemes",              "YSRCP","Neutral"),
    # DMK
    ("DMK wins Tamil Nadu municipal elections sweeping all zones", "DMK",  "Positive"),
    ("DMK leader faces graft charges in Tamil Nadu court",         "DMK",  "Negative"),
    ("DMK holds general council meeting in Chennai",               "DMK",  "Neutral"),
    # AIADMK
    ("AIADMK wins bypolls in Tamil Nadu defeating DMK",            "AIADMK","Positive"),
    ("AIADMK leader expelled amid party revolt and corruption",    "AIADMK","Negative"),
    ("AIADMK holds executive committee meeting",                   "AIADMK","Neutral"),
    # BJD
    ("BJD wins Odisha panchayat elections with thumping majority", "BJD",  "Positive"),
    ("BJD leader arrested in chit fund scam probe in Odisha",      "BJD",  "Negative"),
    ("BJD holds annual convention in Bhubaneswar",                 "BJD",  "Neutral"),
    # JDS
    ("JDS wins Karnataka bypolls strengthening Kumaraswamy",       "JDS",  "Positive"),
    ("JDS leader faces corruption charges in Karnataka court",     "JDS",  "Negative"),
    ("JDS holds state executive meeting in Bengaluru",             "JDS",  "Neutral"),
]

# ── Run tests ────────────────────────────────────────────────────────────────
print("\n" + "=" * 70)
print("  PolitiSense — Full Accuracy Benchmark (18 parties × 3 labels)")
print("=" * 70)

results_by_party  = {}
results_by_label  = {"Positive": [0,0], "Negative": [0,0], "Neutral": [0,0]}
total_pass = 0
failures   = []

print(f"\n{'Headline':<52} {'Party':<8} {'Exp':<10} {'Got':<10} {'Conf':>5}  {''}") 
print("-" * 95)

for headline, party, expected in ALL_TESTS:
    r      = predict(headline, party)
    got    = r["label"]
    conf   = r["confidence"]
    ok     = got == expected

    if party not in results_by_party:
        results_by_party[party] = [0, 0]
    results_by_party[party][1] += 1
    results_by_label[expected][1] += 1

    if ok:
        total_pass += 1
        results_by_party[party][0] += 1
        results_by_label[expected][0] += 1
        status = "✓"
    else:
        failures.append((headline, party, expected, got, conf))
        status = "✗"

    print(f"{headline[:51]:<52} {party:<8} {expected:<10} {got:<10} {conf:>5.2f}  {status}")

# ── Summary ───────────────────────────────────────────────────────────────────
total = len(ALL_TESTS)
print("\n" + "=" * 70)
print(f"  OVERALL:  {total_pass}/{total}  ({100*total_pass/total:.1f}%)")
print("=" * 70)

print("\n  By label:")
for label, (p, t) in results_by_label.items():
    bar = "█" * int(20 * p/t) + "░" * (20 - int(20*p/t))
    print(f"    {label:<10} {bar}  {p}/{t}  ({100*p/t:.0f}%)")

print("\n  By party:")
for party, (p, t) in sorted(results_by_party.items(), key=lambda x: -x[1][0]/x[1][1]):
    bar = "█" * int(10 * p/t) + "░" * (10 - int(10*p/t))
    print(f"    {party:<8} {bar}  {p}/{t}")

if failures:
    print(f"\n  Failed cases ({len(failures)}):")
    for h, par, exp, got, conf in failures:
        print(f"    ✗ [{par}] {h[:55]}")
        print(f"        Expected: {exp}  Got: {got}  Confidence: {conf:.2f}")
else:
    print("\n  ✓ All tests passed!")

print("\n" + "=" * 70)