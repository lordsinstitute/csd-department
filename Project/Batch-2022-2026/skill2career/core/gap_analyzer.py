"""
Analyzes:
- Readiness percentage
- Missing core skills
- Weak supporting skills

FIX: Replaced magic numbers (1, 2) with named constants.
     Now easy to update thresholds without hunting through code.
"""

# ── Constants ────────────────────────────────────────────────────────────
CORE = 2              # importance level = must-have skill
SUPPORTING = 1        # importance level = good-to-have skill
CORE_MIN_LEVEL = 3    # user must rate >= 3 to not be "missing" a core skill
SUPPORT_MIN_LEVEL = 2 # user must rate >= 2 to not be "weak" at supporting skill


# ── Main Function ────────────────────────────────────────────────────────
def analyze_gap(user_input, career_name, career_matrix):
    """
    Returns readiness %, missing core skills, and weak supporting skills
    for a given career based on the user's skill ratings.
    """

    career_skills = career_matrix[career_name]

    total_weight = 0
    achieved_weight = 0

    missing_core = []
    weak_supporting = []

    for skill, importance in career_skills.items():

        user_level = user_input.get(skill, 0)

        # Max possible score for this skill
        total_weight += importance * 5

        # Actual score achieved
        achieved_weight += importance * user_level

        # FIX: using named constants instead of magic numbers
        if importance == CORE and user_level < CORE_MIN_LEVEL:
            missing_core.append(skill)

        if importance == SUPPORTING and user_level < SUPPORT_MIN_LEVEL:
            weak_supporting.append(skill)

    # Calculate readiness percentage
    if total_weight == 0:
        readiness = 0
    else:
        readiness = (achieved_weight / total_weight) * 100

    return {
        "readiness_percent": round(readiness, 2),
        "missing_core_skills": missing_core,
        "weak_supporting_skills": weak_supporting
    }


# ── Optional test block ──────────────────────────────────────────────────
if __name__ == "__main__":
    from src.data.career_data import CAREER_MATRIX

    user_input = {
        "python": 5,
        "machine_learning": 2,
        "sql": 4,
        "communication": 3,
        "problem_solving": 5
    }

    career = "Data Scientist"
    result = analyze_gap(user_input, career, CAREER_MATRIX)

    print(f"Career       : {career}")
    print(f"Readiness    : {result['readiness_percent']}%")
    print(f"Missing Core : {result['missing_core_skills']}")
    print(f"Weak Skills  : {result['weak_supporting_skills']}")