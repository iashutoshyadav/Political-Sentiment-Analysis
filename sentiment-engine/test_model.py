# test_model.py
# Run this from your sentiment-engine/ directory:
#   cd sentiment-engine
#   python test_model.py

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "own_model"))

from predict import predict

print("=" * 65)
print("  PolitiSense Model Test")
print("=" * 65)

# Test cases — we know the expected answer for each
tests = [
    # (headline, party, expected_label)
    ("BJP wins massive majority in Uttar Pradesh elections",     "BJP",  "Positive"),
    ("BJP wins massive majority in Uttar Pradesh elections",     "INC",  "Negative"),
    ("Congress leader arrested in corruption scandal",           "INC",  "Negative"),
    ("Congress leader arrested in corruption scandal",           "BJP",  "Positive"),
    ("AAP opens 500 new mohalla clinics across Delhi",           "AAP",  "Positive"),
    ("Kejriwal arrested by ED in liquor policy case",            "AAP",  "Negative"),
    ("Modi government launches new highway infrastructure",      "BJP",  "Positive"),
    ("SP wins landslide in Uttar Pradesh bypolls",               "SP",   "Positive"),
    ("SP wins landslide in Uttar Pradesh bypolls",               "BJP",  "Negative"),
    ("Mamata Banerjee wins Bengal floor trust vote",             "TMC",  "Positive"),
    ("CBI raids TMC leader home in coal scam probe",             "TMC",  "Negative"),
    ("DMK sweeps Tamil Nadu municipal elections",                "DMK",  "Positive"),
    ("Parliament session begins today",                          "BJP",  "Neutral"),
    ("Budget session of parliament to commence next week",       "INC",  "Neutral"),
    ("BSP rally held in Lucknow ahead of elections",             "BSP",  "Neutral"),
]

passed = 0
failed = 0

print(f"\n{'Headline':<50} {'Party':<8} {'Expected':<10} {'Got':<10} {'Score':>6}  {'Status'}")
print("-" * 105)

for headline, party, expected in tests:
    result = predict(headline, party)
    got    = result["label"]
    score  = result["score"]
    conf   = result["confidence"]
    ok     = got == expected

    if ok:
        passed += 1
        status = "✓ PASS"
    else:
        failed += 1
        status = "✗ FAIL"

    print(f"{headline[:49]:<50} {party:<8} {expected:<10} {got:<10} {score:>6.3f}  {status}")

print("-" * 105)
print(f"\nResults: {passed}/{len(tests)} passed  ({100*passed/len(tests):.0f}%)")

if passed == len(tests):
    print("\n✓ Model is working perfectly!\n")
elif passed >= len(tests) * 0.8:
    print("\n~ Model is working well (minor mismatches are OK for neutral cases)\n")
else:
    print("\n✗ Something may be wrong — check model path and vocab path\n")

# Also show detailed probs for one example
print("=" * 65)
print("  Detailed probability breakdown for one example:")
print("=" * 65)
headline = "BJP wins massive majority in Uttar Pradesh elections"
for party in ["BJP", "INC", "SP"]:
    r = predict(headline, party)
    print(f"\n  '{headline}'")
    print(f"  Party: {party}")
    print(f"  Label: {r['label']}  |  Score: {r['score']}  |  Confidence: {r['confidence']}")
    print(f"  Probs → Negative: {r['probs']['Negative']}  Neutral: {r['probs']['Neutral']}  Positive: {r['probs']['Positive']}")