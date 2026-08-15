"""
Similarity Engine - Skill 2 Career
Hybrid ranking: 60 percent ML probability + 40 percent cosine similarity.

IMPORTANT - old formula was BROKEN:
  OLD: score = 0.7 * cos + 0.3 * (ml_p * cos)
       This multiplied ML INTO cosine so cosine dominated 100 percent.
  NEW: score = 0.60 * ml_p + 0.40 * cos
       ML and cosine are fully independent signals. ML leads.
"""

import numpy as np

def cosine_similarity(vec1, vec2):
    dot = np.dot(vec1, vec2)
    n1  = np.linalg.norm(vec1)
    n2  = np.linalg.norm(vec2)
    if n1 == 0 or n2 == 0:
        return 0.0
    return dot / (n1 * n2)

def _build_career_vectors(career_matrix, skill_list):
    return {
        career: np.array([skills.get(skill, 0) for skill in skill_list], dtype=float)
        for career, skills in career_matrix.items()
    }

def rank_careers(user_vector, career_matrix, skill_list, user_input_raw=None):
    career_vectors = _build_career_vectors(career_matrix, skill_list)
    user_vec = np.array(user_vector, dtype=float)

    cos_scores = {}
    for career, cvec in career_vectors.items():
        cvec_norm = cvec / 2.0
        cos_scores[career] = cosine_similarity(user_vec, cvec_norm)

    ml_scores = None
    if user_input_raw is not None:
        try:
            from core.ml_engine import get_ml_probabilities, MODEL_PATH
            ml_scores = get_ml_probabilities(user_input_raw, skill_list, MODEL_PATH)
        except Exception as e:
            print(f"ML scoring unavailable ({e}), using cosine only")

    if ml_scores:
        max_ml = max(ml_scores.values()) if max(ml_scores.values()) > 0 else 1.0
        results = []
        for career in career_matrix:
            cos  = cos_scores.get(career, 0.0)
            ml_p = ml_scores.get(career, 0.0) / max_ml
            score = 0.60 * ml_p + 0.40 * cos
            results.append((career, score))
    else:
        results = list(cos_scores.items())

    results.sort(key=lambda x: x[1], reverse=True)
    return results
