# ============================================================
# SKILL 2 CAREER — Career Data Loader
# Loads career matrix dynamically from career_data.csv
# CSV format: career, skill1, skill2, ... (wide format)
# Values: 0 = not needed, 1 = supporting, 2 = core
# ============================================================

import csv
import os

# ── Path to CSV (same folder as this file) ─────────────────
_CSV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'career_data.csv')


# ── SKILL DOMAINS (for frontend grouping) ──────────────────
# These are kept here since they're structural, not data
SKILL_DOMAINS = {
    "Technology & Engineering": [
        "python", "javascript", "java", "c_plus_plus", "sql",
        "machine_learning", "deep_learning", "data_visualization",
        "cloud_computing", "cybersecurity", "software_development",
        "web_development", "mobile_development", "devops",
        "networking", "database_management", "embedded_systems",
        "robotics", "iot", "blockchain"
    ],
    "Business & Finance": [
        "financial_modeling", "accounting", "business_strategy",
        "marketing_tools", "sales", "project_management",
        "supply_chain", "entrepreneurship", "data_analysis",
        "excel_advanced", "risk_management", "investment_analysis",
        "economics", "operations_management", "hr_management"
    ],
    "Healthcare & Medicine": [
        "clinical_knowledge", "patient_care", "pharmacology",
        "medical_research", "anatomy", "diagnostics",
        "mental_health_counseling", "nutrition", "public_health",
        "lab_techniques", "epidemiology", "surgical_skills",
        "medical_imaging", "health_informatics", "first_aid"
    ],
    "Law & Politics": [
        "legal_research", "contract_law", "criminal_law",
        "constitutional_law", "negotiation", "policy_analysis",
        "public_speaking", "ethics", "compliance",
        "intellectual_property", "international_law", "advocacy"
    ],
    "Design & Creative Arts": [
        "graphic_design", "ui_ux_design", "cad_design",
        "video_editing", "photography", "illustration",
        "branding", "typography", "motion_graphics",
        "interior_design", "fashion_design", "architecture_design",
        "music_production", "creative_writing", "animation"
    ],
    "Education & Research": [
        "research_methods", "curriculum_development", "teaching",
        "academic_writing", "statistical_analysis", "survey_design",
        "mentoring", "e_learning", "grant_writing",
        "scientific_communication", "lab_management"
    ],
    "Trades & Skilled Work": [
        "electrical_work", "plumbing", "carpentry",
        "mechanical_repair", "welding", "hvac",
        "urban_planning_tools", "civil_engineering",
        "quantity_surveying", "construction_management"
    ],
    "Soft Skills": [
        "communication", "leadership", "teamwork",
        "problem_solving", "analytical_thinking", "creativity",
        "time_management", "emotional_intelligence",
        "critical_thinking", "adaptability"
    ]
}

# ── MASTER SKILL LIST (flat, for vector alignment) ──────────
SKILL_LIST = [skill for skills in SKILL_DOMAINS.values() for skill in skills]


# ── LOAD CAREER MATRIX FROM CSV ────────────────────────────
def _load_career_matrix(csv_path):
    """
    Reads career_data.csv and returns a dict:
    { 'Career Name': { 'skill': importance, ... }, ... }
    Only includes skills with importance > 0.
    """
    career_matrix = {}

    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"career_data.csv not found at: {csv_path}\n"
            "Make sure career_data.csv is in the same folder as career_data.py"
        )

    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            career_name = row['career'].strip()
            skills = {}
            for skill, value in row.items():
                if skill == 'career':
                    continue
                try:
                    importance = int(value)
                    if importance > 0:          # Only store non-zero skills
                        skills[skill] = importance
                except (ValueError, TypeError):
                    pass
            career_matrix[career_name] = skills

    return career_matrix


# ── Load on import ──────────────────────────────────────────
CAREER_MATRIX = _load_career_matrix(_CSV_PATH)


# ── Quick sanity check (only runs when executed directly) ──
if __name__ == '__main__':
    print(f"✅ Loaded {len(CAREER_MATRIX)} careers from CSV")
    print(f"✅ {len(SKILL_LIST)} skills in SKILL_LIST")
    print(f"\nSample — Data Scientist:")
    for skill, imp in CAREER_MATRIX.get('Data Scientist', {}).items():
        label = 'Core' if imp == 2 else 'Supporting'
        print(f"  {skill:<30} {label}")
