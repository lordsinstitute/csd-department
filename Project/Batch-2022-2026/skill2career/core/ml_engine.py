"""
ML Engine — Skill 2 Career

Model Comparison Results (5-fold Stratified CV on 7440 samples):
┌──────────────────────────────┬──────────┬────────┬────────────┬────────┐
│ Model                        │ CV Top-1 │   ±    │ F1-Weighted│  Time  │
├──────────────────────────────┼──────────┼────────┼────────────┼────────┤
│ Logistic Regression  ← USED  │  ~99%+   │  low   │   ~99%+    │  fast  │
│ Random Forest                │  99.56%  │ 0.07%  │   99.56%   │  25s   │
│ KNN (k=3)                    │  99.49%  │ 0.09%  │   99.49%   │   1s   │
└──────────────────────────────┴──────────┴────────┴────────────┴────────┘

Logistic Regression chosen: competitive accuracy on this structured
synthetic dataset, faster training, and simpler model.

NOTE: Delete ml_model.pkl before running app.py to force retrain.

Dataset: 7440 samples (120/career x 62 careers)
Profile types: strong(40%), partial(20%), beginner(15%), sparse(10%), differentiator(15%)
"""

import os
import pickle
import random
import numpy as np

from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder

MODEL_PATH   = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'ml_model.pkl')
RANDOM_STATE = 42


# ── Profile generators ────────────────────────────────────────────────────

def _gen_strong(career_name, career_matrix, skill_list, noise=0.08):
    """High-quality near-expert profile."""
    skills = career_matrix[career_name]
    v = []
    for s in skill_list:
        imp = skills.get(s, 0)
        if imp == 2:   base = random.randint(4, 5)
        elif imp == 1: base = random.randint(3, 5)
        else:          base = random.randint(0, 1)
        if random.random() < noise:
            base = max(0, min(5, base + random.choice([-1, 1])))
        v.append(base)
    return v


def _gen_partial(career_name, career_matrix, skill_list):
    """Profile with some core gaps."""
    skills = career_matrix[career_name]
    core   = [s for s, v in skills.items() if v == 2]
    weaken = random.sample(core, min(2, len(core)))
    v = []
    for s in skill_list:
        imp = skills.get(s, 0)
        if s in weaken:    base = random.randint(1, 3)
        elif imp == 2:     base = random.randint(4, 5)
        elif imp == 1:     base = random.randint(2, 4)
        else:              base = random.randint(0, 1)
        v.append(base)
    return v


def _gen_beginner(career_name, career_matrix, skill_list):
    """Entry-level profile."""
    skills = career_matrix[career_name]
    v = []
    for s in skill_list:
        imp = skills.get(s, 0)
        if imp == 2:   base = random.randint(2, 3)
        elif imp == 1: base = random.randint(1, 2)
        else:          base = 0
        v.append(base)
    return v


def _gen_sparse(career_name, career_matrix, skill_list):
    """Only 3-5 skills rated — simulates new/unsure user."""
    skills = career_matrix[career_name]
    core   = [s for s, v in skills.items() if v == 2]
    rated  = random.sample(core, min(random.randint(3, 5), len(core)))
    return [random.randint(3, 5) if s in rated else 0 for s in skill_list]


def _gen_differentiator(career_name, career_matrix, skill_list):
    """
    Emphasises skills that uniquely belong to this career.
    Fixes confusion between similar careers:
    Robotics vs Embedded, Cloud vs DevOps, Content vs Digital Marketer.
    """
    skills = career_matrix[career_name]
    unique_core = [
        s for s, imp in skills.items()
        if imp == 2 and sum(1 for c, cs in career_matrix.items()
                            if c != career_name and cs.get(s, 0) == 2) <= 3
    ]
    v = []
    for s in skill_list:
        imp = skills.get(s, 0)
        if s in unique_core:   base = 5
        elif imp == 2:         base = random.randint(3, 5)
        elif imp == 1:         base = random.randint(2, 4)
        else:                  base = random.randint(0, 1)
        v.append(base)
    return v


# ── Dataset builder ───────────────────────────────────────────────────────

def _generate_dataset(career_matrix, skill_list, samples_per_career=120):
    """
    5 profile types per career:
      40% strong, 20% partial, 15% beginner, 10% sparse, 15% differentiator
    """
    X, y = [], []
    s1 = int(samples_per_career * 0.40)
    s2 = int(samples_per_career * 0.20)
    s3 = int(samples_per_career * 0.15)
    s4 = int(samples_per_career * 0.10)
    s5 = samples_per_career - s1 - s2 - s3 - s4

    for career in career_matrix:
        for _ in range(s1): X.append(_gen_strong(career, career_matrix, skill_list));         y.append(career)
        for _ in range(s2): X.append(_gen_partial(career, career_matrix, skill_list));        y.append(career)
        for _ in range(s3): X.append(_gen_beginner(career, career_matrix, skill_list));       y.append(career)
        for _ in range(s4): X.append(_gen_sparse(career, career_matrix, skill_list));         y.append(career)
        for _ in range(s5): X.append(_gen_differentiator(career, career_matrix, skill_list)); y.append(career)

    return np.array(X, dtype=float), np.array(y)


# ── Train and save ────────────────────────────────────────────────────────

def train_and_save(career_matrix, skill_list, model_path=MODEL_PATH):
    random.seed(RANDOM_STATE)
    np.random.seed(RANDOM_STATE)

    print("Training ML model (Logistic Regression)...")
    X, y = _generate_dataset(career_matrix, skill_list, samples_per_career=120)

    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    # Logistic Regression — competitive accuracy, fast training
    model = LogisticRegression(
        max_iter=1000,
        C=1.0,
        solver='lbfgs',
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
    model.fit(X, y_encoded)

    with open(model_path, 'wb') as f:
        pickle.dump({'model': model, 'encoder': le, 'skill_list': skill_list}, f)

    print(f"Model saved -> {os.path.basename(model_path)}")
    print(f"  Algorithm : Logistic Regression")
    print(f"  Careers   : {len(career_matrix)}")
    print(f"  Samples   : {len(X)}")
    print(f"  Skills    : {len(skill_list)}")
    print(f"  Run evaluate_model.py to see full CV accuracy scores.")

    return model, le


# ── Load ──────────────────────────────────────────────────────────────────

def load_model(model_path=MODEL_PATH):
    with open(model_path, 'rb') as f:
        data = pickle.load(f)
    return data['model'], data['encoder'], data['skill_list']


# ── Get or train ──────────────────────────────────────────────────────────

def get_model(career_matrix, skill_list, model_path=MODEL_PATH, force_retrain=False):
    if not force_retrain and os.path.exists(model_path):
        model, le, saved_skills = load_model(model_path)
        if saved_skills == skill_list:
            return model, le
        print("Skill list changed — retraining...")
    return train_and_save(career_matrix, skill_list, model_path)


# ── Get ML probability scores ─────────────────────────────────────────────

def get_ml_probabilities(user_input, skill_list, model_path=MODEL_PATH):
    """
    Returns dict of {career_name: probability} for all careers.
    Used by similarity_engine for hybrid ranking (60% ML signal).
    """
    model, le, _ = load_model(model_path)

    user_vector = np.array(
        [user_input.get(skill, 0) for skill in skill_list],
        dtype=float
    ).reshape(1, -1)

    probs = model.predict_proba(user_vector)[0]

    return {
        le.inverse_transform([i])[0]: float(probs[i])
        for i in range(len(probs))
    }
