"""
Converts user skill ratings (0–5) into a normalized vector (0–1).

Why normalize?
Cosine similarity works best when all values are on the same scale.

Example:
    Skill           Rating    Normalized
    python            5         1.0
    sql               3         0.6
    communication     4         0.8

FIX: Added warning for unknown skills so typos don't silently break results.
"""

import warnings

# Max possible skill rating
MAX_RATING = 5


def normalize_skills(user_input_dict, skill_list):
    """
    Takes a dict of {skill: rating} and a master skill list.
    Returns a normalized vector aligned to skill_list order.

    FIX: Now warns if user submits a skill not in the master SKILL_LIST
         instead of silently ignoring it and producing wrong results.
    """

    # Warn about any skills not in master list
    for skill in user_input_dict:
        if skill not in skill_list:
            warnings.warn(
                f"Skill '{skill}' is not in the master SKILL_LIST and will be ignored. "
                f"Check for typos in your skill name.",
                UserWarning
            )

    # Build normalized vector in SKILL_LIST order
    normalized_vector = []

    for skill in skill_list:
        raw_value = user_input_dict.get(skill, 0)

        # Safety clamp — ensure value stays between 0 and MAX_RATING
        clamped = max(0, min(raw_value, MAX_RATING))

        normalized_value = clamped / MAX_RATING
        normalized_vector.append(normalized_value)

    return normalized_vector


# ── Optional test block ──────────────────────────────────────────────────
if __name__ == "__main__":
    from src.data.career_data import SKILL_LIST

    user_input = {
        "python": 5,
        "sql": 3,
        "communication": 4,
        "machine_lerning": 3,  # intentional typo to test warning
    }

    vector = normalize_skills(user_input, SKILL_LIST)

    print("Normalized Vector:")
    for skill, value in zip(SKILL_LIST, vector):
        if value > 0:
            print(f"  {skill:30s} → {value:.2f}")