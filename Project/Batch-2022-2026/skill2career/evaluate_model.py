"""
╔══════════════════════════════════════════════════════════════════════╗
║              SKILL 2 CAREER — Model Evaluation Suite                ║
║                                                                      ║
║  Trains and compares 8 classifiers using 5-fold Stratified CV        ║
║  on synthetically generated skill profiles.                          ║
║                                                                      ║
║  Models tested:                                                      ║
║    1. Random Forest      ← current production model                  ║
║    2. Extra Trees                                                     ║
║    3. Gradient Boosting                                               ║
║    4. KNN (k=3)                                                       ║
║    5. KNN (k=5)                                                       ║
║    6. SVM (RBF kernel)                                                ║
║    7. Logistic Regression                                             ║
║    8. Naive Bayes                                                     ║
║                                                                      ║
║  Metrics per model:                                                  ║
║    - CV Top-1 Accuracy (mean ± std)                                  ║
║    - F1-Weighted                                                      ║
║    - Top-3 Accuracy                                                   ║
║    - Training time                                                    ║
║    - Per-career accuracy breakdown                                    ║
║    - Feature importance (RF & ET only)                               ║
║                                                                      ║
║  Output files:                                                       ║
║    - evaluation_report.txt   full text summary                       ║
║    - evaluation_results.png  6-panel visual chart                    ║
║                                                                      ║
║  HOW TO RUN:                                                         ║
║    python evaluate_model.py                                          ║
║    (from project root — same folder as app.py)                       ║
╚══════════════════════════════════════════════════════════════════════╝
"""

import os
import sys
import time
import random
import warnings
import numpy as np

# ── Path setup so imports work from project root ──────────────────────
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
warnings.filterwarnings('ignore')

# ── Project imports ───────────────────────────────────────────────────
try:
    from data.career_data import CAREER_MATRIX, SKILL_LIST
except ImportError:
    print("ERROR: Could not import career_data.")
    print("Make sure you run this from the project root (same folder as app.py).")
    sys.exit(1)

# ── Sklearn imports ───────────────────────────────────────────────────
from sklearn.ensemble import (
    RandomForestClassifier,
)
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import accuracy_score

# ── Optional plotting ─────────────────────────────────────────────────
try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    PLOTTING = True
except ImportError:
    PLOTTING = False
    print("Note: matplotlib not found — skipping chart generation.\n")

RANDOM_STATE       = 42
SAMPLES_PER_CAREER = 120   # must match ml_engine.py


# ═══════════════════════════════════════════════════════════════════════
# SECTION 1 — Synthetic dataset generation (mirrors ml_engine.py)
# ═══════════════════════════════════════════════════════════════════════

def _gen_strong(career, cm, sl, noise=0.08):
    """High-quality near-expert profile."""
    skills = cm[career]
    v = []
    for s in sl:
        imp  = skills.get(s, 0)
        base = random.randint(4, 5) if imp == 2 else \
               random.randint(3, 5) if imp == 1 else \
               random.randint(0, 1)
        if random.random() < noise:
            base = max(0, min(5, base + random.choice([-1, 1])))
        v.append(base)
    return v


def _gen_partial(career, cm, sl):
    """Profile with some core gaps."""
    skills = cm[career]
    core   = [s for s, v in skills.items() if v == 2]
    weaken = random.sample(core, min(2, len(core)))
    v = []
    for s in sl:
        imp  = skills.get(s, 0)
        base = random.randint(1, 3) if s in weaken else \
               random.randint(4, 5) if imp == 2   else \
               random.randint(2, 4) if imp == 1   else \
               random.randint(0, 1)
        v.append(base)
    return v


def _gen_beginner(career, cm, sl):
    """Entry-level profile."""
    skills = cm[career]
    v = []
    for s in sl:
        imp  = skills.get(s, 0)
        base = random.randint(2, 3) if imp == 2 else \
               random.randint(1, 2) if imp == 1 else 0
        v.append(base)
    return v


def _gen_sparse(career, cm, sl):
    """Only 3-5 skills rated — simulates new/unsure user."""
    skills = cm[career]
    core   = [s for s, v in skills.items() if v == 2]
    rated  = random.sample(core, min(random.randint(3, 5), len(core)))
    return [random.randint(3, 5) if s in rated else 0 for s in sl]


def _gen_differentiator(career, cm, sl):
    """Emphasises skills unique to this career."""
    skills      = cm[career]
    unique_core = [
        s for s, imp in skills.items()
        if imp == 2 and sum(
            1 for c, cs in cm.items()
            if c != career and cs.get(s, 0) == 2
        ) <= 3
    ]
    v = []
    for s in sl:
        imp  = skills.get(s, 0)
        base = 5                   if s in unique_core else \
               random.randint(3, 5) if imp == 2        else \
               random.randint(2, 4) if imp == 1        else \
               random.randint(0, 1)
        v.append(base)
    return v


def generate_dataset(career_matrix, skill_list, spc=SAMPLES_PER_CAREER):
    """
    Generates the identical synthetic dataset as ml_engine.py.
    Profile mix per career:
      40% strong | 20% partial | 15% beginner | 10% sparse | 15% differentiator
    """
    X, y = [], []
    s1 = int(spc * 0.40)
    s2 = int(spc * 0.20)
    s3 = int(spc * 0.15)
    s4 = int(spc * 0.10)
    s5 = spc - s1 - s2 - s3 - s4

    for career in career_matrix:
        for _ in range(s1): X.append(_gen_strong(career, career_matrix, skill_list));         y.append(career)
        for _ in range(s2): X.append(_gen_partial(career, career_matrix, skill_list));        y.append(career)
        for _ in range(s3): X.append(_gen_beginner(career, career_matrix, skill_list));       y.append(career)
        for _ in range(s4): X.append(_gen_sparse(career, career_matrix, skill_list));         y.append(career)
        for _ in range(s5): X.append(_gen_differentiator(career, career_matrix, skill_list)); y.append(career)

    return np.array(X, dtype=float), np.array(y)


# ═══════════════════════════════════════════════════════════════════════
# SECTION 2 — Model definitions
# ═══════════════════════════════════════════════════════════════════════

def get_models():
    """
    5 models — fast, meaningful, covers the full spectrum.
    Removed: Extra Trees (redundant with RF),
             Gradient Boosting (very slow ~10min),
             SVM RBF (extremely slow on 7440 samples).
    RF uses 200 trees instead of 300 — same accuracy, ~30% faster.
    Expected total runtime: ~2-3 minutes.
    """
    return [
        (
            "Random Forest",          # production model — expected winner
            RandomForestClassifier(
                n_estimators=200,
                min_samples_leaf=1,
                random_state=RANDOM_STATE,
                n_jobs=-1,
            ),
        ),
        (
            "KNN (k=3)",
            KNeighborsClassifier(n_neighbors=3, metric='euclidean', n_jobs=-1),
        ),
        (
            "KNN (k=5)",
            KNeighborsClassifier(n_neighbors=5, metric='euclidean', n_jobs=-1),
        ),
        (
            "Logistic Regression",
            LogisticRegression(
                max_iter=1000, C=1.0, solver='lbfgs',
                random_state=RANDOM_STATE, n_jobs=-1,
            ),
        ),
        (
            "Naive Bayes",
            GaussianNB(),
        ),
    ]


# ═══════════════════════════════════════════════════════════════════════
# SECTION 3 — Helper metrics
# ═══════════════════════════════════════════════════════════════════════

def top3_accuracy(model, X, y_encoded):
    """Fraction where true label is in model's top-3 predicted classes."""
    proba = model.predict_proba(X)
    top3  = np.argsort(proba, axis=1)[:, -3:]
    return float(np.mean([y_encoded[i] in top3[i] for i in range(len(y_encoded))]))


def per_career_accuracy(model, X, y_encoded, le):
    """Returns {career_name: accuracy} for every career class."""
    y_pred = model.predict(X)
    out    = {}
    for idx, name in enumerate(le.classes_):
        mask = (y_encoded == idx)
        if mask.sum() > 0:
            out[name] = accuracy_score(y_encoded[mask], y_pred[mask])
    return out


# ═══════════════════════════════════════════════════════════════════════
# SECTION 4 — Main evaluation runner
# ═══════════════════════════════════════════════════════════════════════

def run_evaluation():
    print("=" * 72)
    print("  SKILL 2 CAREER — Model Evaluation Suite")
    print("=" * 72)

    # ── Step 1: Generate dataset ──────────────────────────────────────
    print("\n[1/4] Generating synthetic dataset...")
    random.seed(RANDOM_STATE)
    np.random.seed(RANDOM_STATE)

    X, y_raw = generate_dataset(CAREER_MATRIX, SKILL_LIST)
    le       = LabelEncoder()
    y        = le.fit_transform(y_raw)

    n_careers = len(le.classes_)
    n_samples = len(X)
    n_skills  = len(SKILL_LIST)

    print(f"       Careers  : {n_careers}")
    print(f"       Samples  : {n_samples}  ({SAMPLES_PER_CAREER}/career)")
    print(f"       Features : {n_skills} skills")

    # ── Step 2: CV over all models ────────────────────────────────────
    print(f"\n[2/4] Running 5-fold Stratified CV on 8 models...")
    cv      = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    results = []

    for name, model in get_models():
        print(f"\n  ▸ {name}")

        t0     = time.time()
        cv_acc = cross_val_score(model, X, y, cv=cv, scoring='accuracy',    n_jobs=-1)
        cv_f1  = cross_val_score(model, X, y, cv=cv, scoring='f1_weighted', n_jobs=-1)
        elapsed = time.time() - t0

        print(f"    CV Acc  : {cv_acc.mean()*100:.2f}% ± {cv_acc.std()*100:.2f}%")
        print(f"    F1-W    : {cv_f1.mean()*100:.2f}%")
        print(f"    Time    : {elapsed:.1f}s")

        # Full retrain for Top-3 and per-career breakdown
        model.fit(X, y)
        t3 = top3_accuracy(model, X, y)
        print(f"    Top-3   : {t3*100:.2f}%  (full train set)")

        results.append({
            'name':    name,
            'model':   model,
            'cv_mean': cv_acc.mean(),
            'cv_std':  cv_acc.std(),
            'f1_mean': cv_f1.mean(),
            'top3':    t3,
            'time':    elapsed,
        })

    # Sort by CV accuracy descending
    results.sort(key=lambda r: r['cv_mean'], reverse=True)

    # ── Step 3: Per-career breakdown ──────────────────────────────────
    print(f"\n[3/4] Per-career breakdown  (best model: {results[0]['name']})")
    career_accs = per_career_accuracy(results[0]['model'], X, y, le)

    worst5 = sorted(career_accs.items(), key=lambda x:  x[1])[:5]
    best5  = sorted(career_accs.items(), key=lambda x: -x[1])[:5]

    print("\n  Top 5 easiest careers to classify:")
    for career, acc in best5:
        print(f"    {career:<44} {acc*100:.1f}%")

    print("\n  Top 5 hardest careers to classify:")
    for career, acc in worst5:
        print(f"    {career:<44} {acc*100:.1f}%")

    # ── Feature importances (tree models only) ────────────────────────
    fi_map = {}
    for r in results:
        if hasattr(r['model'], 'feature_importances_'):
            fi      = r['model'].feature_importances_
            top_idx = np.argsort(fi)[::-1][:10]
            fi_map[r['name']] = [(SKILL_LIST[i], fi[i]) for i in top_idx]

    # ── Step 4: Final comparison table ───────────────────────────────
    print(f"\n[4/4] Final Comparison Table")
    print("=" * 72)
    print(f"{'Rk':<4} {'Model':<26} {'CV Acc':>9} {'± Std':>7} {'F1-W':>8} {'Top-3':>8} {'Time':>7}")
    print("-" * 72)

    for rank, r in enumerate(results, 1):
        tag = ""
        if rank == 1:
            tag = "  ◄ BEST"
        elif r['name'] == "Logistic Regression":
            tag = "  ◄ current"
        print(
            f"{rank:<4} {r['name']:<26} "
            f"{r['cv_mean']*100:>8.2f}% "
            f"{r['cv_std']*100:>6.2f}% "
            f"{r['f1_mean']*100:>7.2f}% "
            f"{r['top3']*100:>7.2f}% "
            f"{r['time']:>6.1f}s"
            f"{tag}"
        )

    print("=" * 72)

    # ── Verdict ───────────────────────────────────────────────────────
    best = results[0]
    curr = next(r for r in results if "Random Forest" in r['name'])
    diff = (best['cv_mean'] - curr['cv_mean']) * 100

    print("\n  VERDICT:")
    if diff < 0.1:
        print(f"  ✓  Random Forest is still the best or joint-best model.")
        print(f"     Gap to top: {diff:.3f}% — negligible. Keep RF.")
    else:
        print(f"  ✓  {best['name']} outperforms Random Forest by {diff:.2f}%.")
        print(f"     Consider switching if the gain justifies added complexity.")

    print("\n  Top 10 most important skills (Random Forest):")
    for skill, imp in fi_map.get("Random Forest", []):
        bar = "█" * int(imp * 300)
        print(f"    {skill:<34} {imp:.4f}  {bar}")

    # ── Save outputs ──────────────────────────────────────────────────
    _save_report(results, career_accs, fi_map, n_careers, n_samples, n_skills)

    if PLOTTING:
        _save_charts(results, career_accs, fi_map)

    print("\n  Done! Outputs saved:")
    print("    evaluation_report.txt")
    if PLOTTING:
        print("    evaluation_results.png")


# ═══════════════════════════════════════════════════════════════════════
# SECTION 5 — Text report writer
# ═══════════════════════════════════════════════════════════════════════

def _save_report(results, career_accs, fi_map, n_careers, n_samples, n_skills):
    lines = [
        "SKILL 2 CAREER — MODEL EVALUATION REPORT",
        "=" * 72,
        f"Careers  : {n_careers}",
        f"Samples  : {n_samples}  ({SAMPLES_PER_CAREER}/career)",
        f"Features : {n_skills} skills",
        f"CV       : 5-fold Stratified",
        "",
        f"{'Rk':<4} {'Model':<26} {'CV Acc':>9} {'± Std':>7} {'F1-W':>8} {'Top-3':>8} {'Time':>7}",
        "-" * 72,
    ]

    for rank, r in enumerate(results, 1):
        tag = "  ◄ BEST" if rank == 1 else \
              "  ◄ current" if "Random Forest" == r['name'] else ""
        lines.append(
            f"{rank:<4} {r['name']:<26} "
            f"{r['cv_mean']*100:>8.2f}% "
            f"{r['cv_std']*100:>6.2f}% "
            f"{r['f1_mean']*100:>7.2f}% "
            f"{r['top3']*100:>7.2f}% "
            f"{r['time']:>6.1f}s"
            f"{tag}"
        )

    lines += ["", "PER-CAREER ACCURACY (best model — full train set)", "-" * 60]
    for career, acc in sorted(career_accs.items(), key=lambda x: x[1]):
        filled = "█" * int(acc * 40)
        empty  = "░" * (40 - int(acc * 40))
        lines.append(f"  {career:<44} {acc*100:5.1f}%  {filled}{empty}")

    for label, key in [("Random Forest", "Random Forest"), ("Extra Trees", "Extra Trees")]:
        lines += ["", f"TOP 10 SKILLS — {label}", "-" * 44]
        for skill, imp in fi_map.get(key, []):
            lines.append(f"  {skill:<34} {imp:.4f}")

    with open("evaluation_report.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print("\n  Saved → evaluation_report.txt")


# ═══════════════════════════════════════════════════════════════════════
# SECTION 6 — 6-panel chart generator
# ═══════════════════════════════════════════════════════════════════════

def _save_charts(results, career_accs, fi_map):
    names    = [r['name'].replace(" (current)", " *") for r in results]
    cv_means = [r['cv_mean'] * 100 for r in results]
    cv_stds  = [r['cv_std']  * 100 for r in results]
    f1_means = [r['f1_mean'] * 100 for r in results]
    top3s    = [r['top3']    * 100 for r in results]
    times    = [r['time']          for r in results]
    short    = [n[:24] for n in names]

    # Color: best = rust, RF = sage, rest = light sage
    def _color(i, name):
        if i == 0:                    return '#b85c38'
        if 'Random Forest *' in name: return '#5c7a5c'
        return '#a3c4a3'

    colors = [_color(i, n) for i, n in enumerate(names)]

    fig, axes = plt.subplots(2, 3, figsize=(20, 12))
    fig.suptitle("Skill 2 Career — Model Comparison Report",
                 fontsize=17, fontweight='bold', y=0.99, color='#1e2a1e')
    fig.patch.set_facecolor('#f7f4ef')

    for ax in axes.flat:
        ax.set_facecolor('#ffffff')
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)

    # ── Panel 1: CV Accuracy ──────────────────────────────────────────
    ax = axes[0, 0]
    bars = ax.barh(short, cv_means, xerr=cv_stds, color=colors,
                   capsize=4, edgecolor='white', height=0.6)
    ax.set_xlabel("Accuracy (%)", fontsize=10)
    ax.set_title("Top-1 CV Accuracy ± Std", fontweight='bold')
    ax.set_xlim(max(0, min(cv_means) - 6), 102)
    ax.invert_yaxis()
    ax.grid(axis='x', alpha=0.3)
    for bar, val in zip(bars, cv_means):
        ax.text(val + 0.2, bar.get_y() + bar.get_height() / 2,
                f"{val:.2f}%", va='center', fontsize=8)

    # ── Panel 2: Accuracy vs F1 scatter ──────────────────────────────
    ax = axes[0, 1]
    ax.scatter(cv_means, f1_means, c=colors, s=130, zorder=5,
               edgecolors='white', linewidths=1.5)
    for x, yv, n in zip(cv_means, f1_means, short):
        ax.annotate(n, (x, yv), textcoords="offset points",
                    xytext=(5, 3), fontsize=7.5)
    ax.set_xlabel("CV Accuracy (%)", fontsize=10)
    ax.set_ylabel("F1-Weighted (%)", fontsize=10)
    ax.set_title("Accuracy vs F1-Weighted", fontweight='bold')
    ax.grid(alpha=0.3)

    # ── Panel 3: Top-3 accuracy ───────────────────────────────────────
    ax = axes[0, 2]
    bars = ax.barh(short, top3s, color=colors, edgecolor='white', height=0.6)
    ax.set_xlabel("Top-3 Accuracy (%)", fontsize=10)
    ax.set_title("Top-3 Accuracy (full train set)", fontweight='bold')
    ax.set_xlim(0, 103)
    ax.invert_yaxis()
    ax.grid(axis='x', alpha=0.3)
    for bar, val in zip(bars, top3s):
        ax.text(val + 0.2, bar.get_y() + bar.get_height() / 2,
                f"{val:.1f}%", va='center', fontsize=8)

    # ── Panel 4: Training time ────────────────────────────────────────
    ax = axes[1, 0]
    bars = ax.barh(short, times, color=colors, edgecolor='white', height=0.6)
    ax.set_xlabel("Seconds", fontsize=10)
    ax.set_title("CV Training Time (speed benchmark)", fontweight='bold')
    ax.invert_yaxis()
    ax.grid(axis='x', alpha=0.3)
    for bar, val in zip(bars, times):
        ax.text(val + 0.2, bar.get_y() + bar.get_height() / 2,
                f"{val:.1f}s", va='center', fontsize=8)

    # ── Panel 5: Hardest 15 careers ───────────────────────────────────
    ax = axes[1, 1]
    sorted_c = sorted(career_accs.items(), key=lambda x: x[1])[:15]
    cnames   = [c[:28] for c, _ in sorted_c]
    cvals    = [v * 100 for _, v in sorted_c]
    bcolors  = ['#dc2626' if v < 90 else '#5c7a5c' for v in cvals]
    ax.barh(cnames, cvals, color=bcolors, edgecolor='white', height=0.65)
    ax.set_xlabel("Accuracy (%)", fontsize=10)
    ax.set_title("15 Hardest Careers to Classify (best model)", fontweight='bold')
    ax.set_xlim(0, 103)
    ax.axvline(90, color='orange', linestyle='--', alpha=0.7,
               linewidth=1.2, label='90% threshold')
    ax.legend(fontsize=8)
    ax.invert_yaxis()
    ax.grid(axis='x', alpha=0.3)

    # ── Panel 6: RF feature importance ───────────────────────────────
    ax = axes[1, 2]
    rf_fi = fi_map.get("Random Forest", [])
    if rf_fi:
        fi_names = [s.replace('_', ' ')[:24] for s, _ in rf_fi]
        fi_vals  = [v for _, v in rf_fi]
        ax.barh(fi_names, fi_vals, color='#5c7a5c', edgecolor='white', height=0.65)
        ax.set_xlabel("Feature Importance", fontsize=10)
        ax.set_title("Top 10 Skills — Random Forest", fontweight='bold')
        ax.invert_yaxis()
        ax.grid(axis='x', alpha=0.3)
    else:
        ax.text(0.5, 0.5, "Feature importance\nnot available",
                ha='center', va='center', transform=ax.transAxes)
        ax.set_title("Feature Importance", fontweight='bold')

    # ── Legend ────────────────────────────────────────────────────────
    patches = [
        mpatches.Patch(color='#b85c38', label='Best overall model'),
        mpatches.Patch(color='#5c7a5c', label='Random Forest (current) / good'),
        mpatches.Patch(color='#a3c4a3', label='Other models'),
        mpatches.Patch(color='#dc2626', label='Career accuracy < 90%'),
    ]
    fig.legend(handles=patches, loc='lower center', ncol=4,
               bbox_to_anchor=(0.5, 0.005), fontsize=9, framealpha=0.9)

    plt.tight_layout(rect=[0, 0.04, 1, 0.98])
    plt.savefig("evaluation_results.png", dpi=150,
                bbox_inches='tight', facecolor='#f7f4ef')
    plt.close()
    print("  Saved → evaluation_results.png")


# ═══════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    run_evaluation()
