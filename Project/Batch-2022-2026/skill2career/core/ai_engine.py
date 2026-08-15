"""
AI Engine — Hybrid Version
- Uses GPT for rich explanations and roadmaps (with smart fallback if quota exceeded)
- Smart rule-based fallback includes: courses, certifications, and project ideas
- Roadmap is fully personalized based on career domain + actual skill gaps
"""

import os
import json

try:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    OPENAI_AVAILABLE = True
except Exception:
    OPENAI_AVAILABLE = False


# ═══════════════════════════════════════════════════════════════════════
# SECTION 1 — Explanation (unchanged)
# ═══════════════════════════════════════════════════════════════════════

def generate_explanation(career_name, match_percent, missing_core, weak_supporting, user_skills):
    """
    Try GPT first. If quota/error, fall back to rule-based explanation.
    """
    if OPENAI_AVAILABLE:
        try:
            top_skills = [s for s, v in sorted(user_skills.items(), key=lambda x: -x[1]) if v >= 3][:4]
            prompt = f"""
You are a career advisor AI. In 2-3 concise sentences, explain why "{career_name}" 
is a {match_percent}% match for this person.

Their strongest skills: {', '.join(top_skills) if top_skills else 'still developing'}.
Missing core skills: {', '.join(missing_core) if missing_core else 'none — fully ready'}.
Weak supporting skills: {', '.join(weak_supporting) if weak_supporting else 'none'}.

Be encouraging but honest. Don't use bullet points. Speak directly to the user.
"""
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=120,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception:
            pass

    return _rule_based_explanation(career_name, match_percent, missing_core, weak_supporting, user_skills)


def _rule_based_explanation(career_name, match_percent, missing_core, weak_supporting, user_skills):
    if match_percent >= 80:
        opener   = f"You're an excellent fit for {career_name}."
        strength = "Your profile aligns strongly with this role's core requirements."
    elif match_percent >= 60:
        opener   = f"You show strong potential for {career_name}."
        strength = "Your current skill set gives you a solid foundation for this career."
    elif match_percent >= 40:
        opener   = f"You have a reasonable foundation for {career_name}."
        strength = "With some focused effort, you can become a competitive candidate for this role."
    else:
        opener   = f"{career_name} is an ambitious but achievable goal."
        strength = "This role will require targeted upskilling, but your profile shows promise."

    if missing_core:
        gap = "Check the Gaps tab to see exactly what to develop to become fully career-ready."
    elif weak_supporting:
        gap = "You're nearly there — a few supporting skills would make you even more competitive."
    else:
        gap = "You meet all the core requirements — you're career-ready!"

    return f"{opener} {strength} {gap}"


# ═══════════════════════════════════════════════════════════════════════
# SECTION 2 — Career domain knowledge base
# Courses, certifications, and project ideas per career/domain
# ═══════════════════════════════════════════════════════════════════════

# Maps career names to their domain key
CAREER_DOMAIN_MAP = {
    # Tech
    "Data Scientist":              "data_science",
    "ML Engineer":                 "ml_engineering",
    "Data Engineer":               "data_engineering",
    "Data Analyst (Research)":     "data_analysis",
    "Software Developer":          "software_dev",
    "Full Stack Developer":        "software_dev",
    "Mobile App Developer":        "software_dev",
    "Cloud Engineer":              "cloud_devops",
    "DevOps Engineer":             "cloud_devops",
    "Cybersecurity Analyst":       "cybersecurity",
    "Network Engineer":            "networking",
    "Embedded Systems Engineer":   "embedded",
    "Robotics Engineer":           "robotics",
    "IoT Engineer":                "iot",
    "Blockchain Developer":        "blockchain",
    # Business
    "Financial Analyst":           "finance",
    "Investment Banker":           "finance",
    "Accountant":                  "accounting",
    "Business Analyst":            "business",
    "Product Manager":             "product",
    "Marketing Analyst":           "marketing",
    "Digital Marketer":            "marketing",
    "Content Creator / Influencer":"marketing",
    "Sales Manager":               "sales",
    "Supply Chain Manager":        "supply_chain",
    "HR Specialist":               "hr",
    "Entrepreneur":                "entrepreneurship",
    "Management Consultant":       "consulting",
    "Operations Manager":          "operations",
    # Healthcare
    "Doctor (General Physician)":  "medicine",
    "Surgeon":                     "medicine",
    "Pharmacist":                  "pharmacy",
    "Nurse":                       "nursing",
    "Psychologist / Therapist":    "psychology",
    "Public Health Specialist":    "public_health",
    "Nutritionist / Dietitian":    "nutrition",
    "Radiologist":                 "radiology",
    "Health Informatics Specialist":"health_informatics",
    # Law
    "Lawyer":                      "law",
    "Criminal Lawyer":             "law",
    "Policy Analyst":              "policy",
    "Compliance Officer":          "compliance",
    "Diplomat / International Relations": "diplomacy",
    # Design
    "UI/UX Designer":              "ux_design",
    "Graphic Designer":            "graphic_design",
    "Video Editor / Filmmaker":    "video",
    "Architect":                   "architecture",
    "Interior Designer":           "interior_design",
    "Fashion Designer":            "fashion",
    "Animator":                    "animation",
    "Music Producer":              "music",
    # Education
    "Teacher / Educator":          "education",
    "Research Scientist":          "research",
    "University Professor":        "academia",
    "Instructional Designer":      "instructional_design",
    # Engineering
    "Civil Engineer":              "civil_engineering",
    "Electrical Engineer":         "electrical_engineering",
    "Urban Planner":               "urban_planning",
    "Construction Manager":        "construction",
    # Media
    "Journalist / Reporter":       "journalism",
    "Public Relations Specialist": "pr",
    "Technical Writer":            "technical_writing",
    "Broadcaster / Presenter":     "broadcasting",
}

# Domain knowledge base — courses, certs, projects
DOMAIN_KNOWLEDGE = {

    "data_science": {
        "courses": [
            "IBM Data Science Professional Certificate (Coursera)",
            "Python for Data Science, AI & Development (Coursera)",
            "Statistics with Python Specialization (Coursera)",
            "Fast.ai — Practical Deep Learning for Coders",
        ],
        "certifications": [
            "IBM Data Science Professional Certificate",
            "Google Professional Data Engineer",
            "Microsoft Certified: Azure Data Scientist Associate",
            "Databricks Certified Associate Developer",
        ],
        "projects": [
            "Build an end-to-end ML pipeline: data cleaning → model → deployment",
            "Create a salary prediction model using public datasets (Kaggle)",
            "Build a recommendation system (movies, products, or books)",
            "Perform exploratory data analysis on a real-world dataset and publish findings",
        ],
    },

    "ml_engineering": {
        "courses": [
            "Machine Learning Specialization — Andrew Ng (Coursera)",
            "Deep Learning Specialization — deeplearning.ai",
            "MLOps Specialization (Coursera)",
            "Hands-On Machine Learning with Scikit-Learn & TensorFlow (book + practice)",
        ],
        "certifications": [
            "TensorFlow Developer Certificate (Google)",
            "AWS Certified Machine Learning — Specialty",
            "Microsoft Certified: Azure AI Engineer Associate",
            "Databricks Certified ML Professional",
        ],
        "projects": [
            "Train and deploy a custom image classification model as a REST API",
            "Build an NLP sentiment analysis pipeline with BERT",
            "Implement MLOps: CI/CD pipeline for a machine learning model",
            "Replicate a research paper and publish results on GitHub",
        ],
    },

    "data_engineering": {
        "courses": [
            "Data Engineering Zoomcamp (DataTalks.Club — free)",
            "IBM Data Engineering Professional Certificate (Coursera)",
            "Apache Spark with Python — Big Data (Udemy)",
            "dbt Fundamentals (dbt Learn — free)",
        ],
        "certifications": [
            "Google Professional Data Engineer",
            "AWS Certified Data Analytics — Specialty",
            "Databricks Certified Data Engineer Associate",
            "Snowflake SnowPro Core Certification",
        ],
        "projects": [
            "Build a batch ETL pipeline using Apache Airflow and PostgreSQL",
            "Create a real-time streaming pipeline using Kafka and Spark",
            "Design a data warehouse schema and load data from multiple sources",
            "Build a dbt project transforming raw data into analytics-ready tables",
        ],
    },

    "data_analysis": {
        "courses": [
            "Google Data Analytics Professional Certificate (Coursera)",
            "Excel to MySQL: Analytic Techniques for Business (Coursera)",
            "Python for Everybody Specialization (Coursera)",
            "Tableau Desktop Specialist training (Tableau Learning)",
        ],
        "certifications": [
            "Google Data Analytics Professional Certificate",
            "Microsoft Power BI Data Analyst Associate (PL-300)",
            "Tableau Desktop Specialist",
            "IBM Data Analyst Professional Certificate",
        ],
        "projects": [
            "Analyze a public dataset (e.g. COVID, sales data) and build a Tableau/Power BI dashboard",
            "Perform A/B test analysis on a simulated marketing dataset",
            "Build an automated Excel/Google Sheets report with charts and KPIs",
            "Conduct a full business analysis case study with recommendations",
        ],
    },

    "software_dev": {
        "courses": [
            "The Odin Project (free full-stack curriculum)",
            "CS50: Introduction to Computer Science (Harvard — free)",
            "100 Days of Code: Python Bootcamp (Udemy)",
            "Full Stack Open (University of Helsinki — free)",
        ],
        "certifications": [
            "AWS Certified Developer — Associate",
            "Oracle Java SE Programmer Certification",
            "Microsoft Certified: Azure Developer Associate",
            "Google Associate Android Developer",
        ],
        "projects": [
            "Build and deploy a full-stack web app (e.g. task manager, blog, e-commerce)",
            "Contribute to an open-source project on GitHub",
            "Create a REST API with authentication and connect it to a frontend",
            "Build a mobile app and publish it on the Play Store or App Store",
        ],
    },

    "cloud_devops": {
        "courses": [
            "AWS Cloud Practitioner Essentials (AWS Training — free)",
            "Google Cloud Fundamentals (Coursera)",
            "Docker and Kubernetes: The Complete Guide (Udemy)",
            "DevOps Bootcamp: Terraform, Docker, CI/CD (Udemy)",
        ],
        "certifications": [
            "AWS Certified Solutions Architect — Associate",
            "Google Professional Cloud Architect",
            "Microsoft Certified: Azure Administrator Associate (AZ-104)",
            "Certified Kubernetes Administrator (CKA)",
        ],
        "projects": [
            "Deploy a containerized app using Docker + Kubernetes on AWS/GCP",
            "Build a CI/CD pipeline using GitHub Actions or Jenkins",
            "Set up infrastructure as code using Terraform",
            "Implement auto-scaling and monitoring for a cloud application",
        ],
    },

    "cybersecurity": {
        "courses": [
            "Google Cybersecurity Professional Certificate (Coursera)",
            "CompTIA Security+ Study Course (Professor Messer — free)",
            "Ethical Hacking Bootcamp (Udemy)",
            "TryHackMe or HackTheBox (hands-on labs)",
        ],
        "certifications": [
            "CompTIA Security+",
            "Certified Ethical Hacker (CEH)",
            "CompTIA Network+",
            "Certified Information Systems Security Professional (CISSP)",
        ],
        "projects": [
            "Set up a home lab with VMs and practice penetration testing",
            "Complete 50+ challenges on TryHackMe or HackTheBox",
            "Build a network traffic analyser using Python and Wireshark",
            "Document a vulnerability assessment report for a test environment",
        ],
    },

    "finance": {
        "courses": [
            "Financial Markets — Robert Shiller (Coursera — free to audit)",
            "Investment Management Specialization (Coursera)",
            "Excel Skills for Business Specialization (Coursera)",
            "CFA Institute Investment Foundations (free)",
        ],
        "certifications": [
            "CFA (Chartered Financial Analyst) — Level 1",
            "Financial Modeling & Valuation Analyst (FMVA) — CFI",
            "Bloomberg Market Concepts (BMC) Certificate",
            "CPA (Certified Public Accountant) — if accounting focused",
        ],
        "projects": [
            "Build a DCF (Discounted Cash Flow) valuation model in Excel for a real company",
            "Create a stock portfolio tracker with live data using Python",
            "Analyse and present a financial case study for an industry of your choice",
            "Build a budget/forecasting model for a simulated business",
        ],
    },

    "accounting": {
        "courses": [
            "Accounting Fundamentals — Corporate Finance Institute (free)",
            "Intuit Academy Bookkeeping Certificate (Coursera)",
            "Financial Accounting — Wharton (Coursera)",
            "QuickBooks Online Training (QuickBooks Learning)",
        ],
        "certifications": [
            "ACCA (Association of Chartered Certified Accountants)",
            "CPA (Certified Public Accountant)",
            "Certified Management Accountant (CMA)",
            "QuickBooks ProAdvisor Certification (free)",
        ],
        "projects": [
            "Prepare a complete set of financial statements for a simulated company",
            "Build an automated bookkeeping tracker in Excel with pivot tables",
            "Perform a financial ratio analysis comparing two publicly listed companies",
            "Create a personal or small business tax preparation simulation",
        ],
    },

    "marketing": {
        "courses": [
            "Google Digital Marketing & E-commerce Certificate (Coursera)",
            "Meta Social Media Marketing Certificate (Coursera)",
            "HubSpot Content Marketing Certification (free)",
            "SEO Training — Moz or Ahrefs Academy (free)",
        ],
        "certifications": [
            "Google Analytics Individual Qualification (GAIQ)",
            "HubSpot Marketing Hub Certification",
            "Meta Blueprint Certification",
            "Google Ads Search Certification",
        ],
        "projects": [
            "Run a real social media campaign for a club, NGO, or personal brand",
            "Build and grow a blog or YouTube channel from 0 to 100 followers",
            "Conduct an SEO audit for a website and implement improvements",
            "Design a complete digital marketing strategy for a mock product launch",
        ],
    },

    "product": {
        "courses": [
            "Product Management First Steps (LinkedIn Learning)",
            "Digital Product Management Specialization (Coursera — UVA)",
            "Agile with Atlassian Jira (Coursera — free to audit)",
            "PM School or Reforge (advanced)",
        ],
        "certifications": [
            "Certified Scrum Product Owner (CSPO)",
            "Professional Scrum Product Owner (PSPO)",
            "Google Project Management Certificate (Coursera)",
            "PMI Agile Certified Practitioner (PMI-ACP)",
        ],
        "projects": [
            "Write a full Product Requirements Document (PRD) for an app idea",
            "Conduct user research interviews and synthesize findings into user stories",
            "Build and prioritize a product backlog using a public tool like Linear or Jira",
            "Create a product roadmap with OKRs for a real or imaginary product",
        ],
    },

    "ux_design": {
        "courses": [
            "Google UX Design Professional Certificate (Coursera)",
            "Interaction Design Foundation courses (affordable subscription)",
            "UI/UX Design Bootcamp — Zero to Mastery (Udemy)",
            "Figma for Beginners (Figma — free)",
        ],
        "certifications": [
            "Google UX Design Certificate",
            "Certified User Experience Professional (CUXP)",
            "Interaction Design Foundation UX Certificate",
            "Nielsen Norman Group UX Certification",
        ],
        "projects": [
            "Redesign an existing app's UI/UX and document the process with before/after",
            "Conduct 5 user interviews and build personas + journey maps",
            "Create a fully interactive prototype in Figma for a mobile app",
            "Build a complete design system with components, typography, and colour tokens",
        ],
    },

    "graphic_design": {
        "courses": [
            "Graphic Design Specialization — CalArts (Coursera)",
            "Adobe Illustrator CC — Essentials (Udemy)",
            "Canva Design School (free)",
            "Graphic Design Bootcamp — Photoshop, Illustrator, InDesign (Udemy)",
        ],
        "certifications": [
            "Adobe Certified Professional — Photoshop / Illustrator",
            "Canva Certified Creator",
            "Graphic Design Certificate — AIGA (portfolio based)",
        ],
        "projects": [
            "Design a complete brand identity: logo, colour palette, typography, business card",
            "Create a social media content kit for an imaginary brand (10+ posts)",
            "Design a magazine or brochure layout in InDesign",
            "Redesign the logo and visual identity of an existing brand",
        ],
    },

    "law": {
        "courses": [
            "An Introduction to American Law — Penn (Coursera — free to audit)",
            "Contracts Law — Darden (Coursera)",
            "Legal Research and Writing — various law school MOOCs",
            "Introduction to International Criminal Law (Coursera)",
        ],
        "certifications": [
            "Bar Exam (jurisdiction-specific — primary qualification)",
            "Paralegal Certificate — NALA or NFPA",
            "LLM (Master of Laws) — specialization",
            "Certified Compliance & Ethics Professional (CCEP)",
        ],
        "projects": [
            "Draft and review a sample contract (NDA, employment agreement)",
            "Write a legal memo analyzing a landmark case in your area of interest",
            "Participate in a moot court competition or mock trial",
            "Research and present a policy brief on a current legal issue",
        ],
    },

    "medicine": {
        "courses": [
            "Introduction to Clinical Neurology (Coursera — UCSF)",
            "Anatomy Specialization — University of Michigan (Coursera)",
            "Patient Safety (Coursera — Johns Hopkins)",
            "Health for All Through Primary Health Care (Coursera — WHO)",
        ],
        "certifications": [
            "USMLE / equivalent medical licensing exam (primary qualification)",
            "BLS / ACLS Certification (American Heart Association)",
            "ATLS — Advanced Trauma Life Support",
            "Board Certification in specialty (post-residency)",
        ],
        "projects": [
            "Write a clinical case report on an interesting patient scenario",
            "Volunteer at a clinic or hospital to build patient care experience",
            "Conduct a literature review on a medical topic and present findings",
            "Participate in a medical simulation or skills lab",
        ],
    },

    "psychology": {
        "courses": [
            "Introduction to Psychology — Paul Bloom (Yale/Coursera — free)",
            "Psychological First Aid (Coursera — Johns Hopkins)",
            "CBT Techniques for Mental Health (various platforms)",
            "The Science of Well-Being (Coursera — Yale)",
        ],
        "certifications": [
            "Licensed Professional Counselor (LPC) — state specific",
            "Certified Clinical Mental Health Counselor (CCMHC)",
            "CBT Certificate — Beck Institute",
            "Mental Health First Aid Certificate",
        ],
        "projects": [
            "Conduct a structured literature review on a psychological disorder",
            "Design and run a small survey study on behavior or attitudes",
            "Write a detailed case conceptualization using a chosen therapy model",
            "Volunteer at a mental health helpline or community support service",
        ],
    },

    "education": {
        "courses": [
            "Foundations of Teaching for Learning (Coursera — Commonwealth)",
            "Learning How to Learn (Coursera — free)",
            "Instructional Design MasterClass (Udemy)",
            "Teaching English as a Foreign Language (TEFL) online courses",
        ],
        "certifications": [
            "Teaching License / B.Ed (primary qualification)",
            "TEFL/TESOL Certificate",
            "Google Certified Educator Level 1 & 2",
            "Certified Online Instructor (COI)",
        ],
        "projects": [
            "Design a full lesson plan with objectives, activities, and assessments",
            "Create a short online course on any topic using tools like Teachable or Google Sites",
            "Develop a curriculum unit with differentiated instruction strategies",
            "Record and upload 3 educational videos on a topic you're skilled in",
        ],
    },

    "research": {
        "courses": [
            "Research Methods — various university MOOCs (Coursera/edX)",
            "Statistics with R Specialization (Coursera — Duke)",
            "Academic Writing in English (Coursera)",
            "Introduction to Data Science in Python (Coursera — Michigan)",
        ],
        "certifications": [
            "GRE/GMAT — for graduate research programs",
            "IRB Human Subjects Research Certification (CITI Program)",
            "Certified Research Administrator (CRA)",
            "Google Scholar / ORCID profile (research identity)",
        ],
        "projects": [
            "Design and execute an original research study (even small-scale)",
            "Write and submit a research paper to a student or open journal",
            "Replicate a published study and document findings",
            "Present research at a student conference or symposium",
        ],
    },

    "civil_engineering": {
        "courses": [
            "AutoCAD — Complete Course (Udemy)",
            "Introduction to Structural Analysis (edX)",
            "Construction Project Management (Coursera — Columbia)",
            "Revit Architecture Fundamentals (Autodesk Learning)",
        ],
        "certifications": [
            "FE (Fundamentals of Engineering) Exam — NCEES",
            "PE (Professional Engineer) License",
            "AutoCAD Certified User",
            "PMP (Project Management Professional)",
        ],
        "projects": [
            "Design a structural element (beam, column) using AutoCAD or Revit",
            "Create a detailed construction project plan with timeline and budget",
            "Perform a site analysis and produce a written report",
            "Build a scale model of a structural design",
        ],
    },

    "journalism": {
        "courses": [
            "Journalism Skills for Engaged Citizens (Coursera — Melbourne)",
            "Introduction to Data Journalism (Knight Center — free)",
            "Digital Journalism (edX)",
            "Investigative Reporting (various journalism school MOOCs)",
        ],
        "certifications": [
            "NCTJ Diploma in Journalism",
            "Google News Initiative Training Certificate",
            "Data Journalism Certificate — Knight Center",
            "SPJ (Society of Professional Journalists) membership + training",
        ],
        "projects": [
            "Write and publish 5 articles on a blog or Medium on topics you care about",
            "Conduct a data-driven investigative piece using public datasets",
            "Interview 3 professionals and write a feature story",
            "Create a multimedia journalism piece combining text, photos, and video",
        ],
    },

    "entrepreneurship": {
        "courses": [
            "Entrepreneurship Specialization — Wharton (Coursera)",
            "How to Build a Startup — Steve Blank (Udacity — free)",
            "Developing Innovative Ideas (Coursera — Maryland)",
            "Y Combinator Startup School (free)",
        ],
        "certifications": [
            "Y Combinator Startup School Certificate",
            "Google for Startups programs",
            "AWS Activate (startup program)",
            "Lean Startup Methodology (various platforms)",
        ],
        "projects": [
            "Build and launch an MVP (Minimum Viable Product) — even a simple one",
            "Conduct 20 customer discovery interviews and document insights",
            "Create a full business plan with financials and market analysis",
            "Pitch your startup idea at a local competition or hackathon",
        ],
    },

    # Generic fallback for any domain not explicitly listed
    "_default": {
        "courses": [
            "Search Coursera or edX for beginner courses in your target field",
            "Look for free MOOCs from top universities on OpenCourseWare",
            "YouTube channels dedicated to your field (free, high-quality content)",
            "LinkedIn Learning — broad library across all professional domains",
        ],
        "certifications": [
            "Research the top 2-3 certifications recognized in your field",
            "Check professional associations in your domain for endorsed credentials",
            "Look for vendor-specific certifications relevant to your tools",
        ],
        "projects": [
            "Build one real-world project applying your top 3 skills",
            "Document your project with a case study and publish it online",
            "Contribute to a community project or volunteer your skills",
            "Enter a competition or hackathon related to your target career",
        ],
    },
}


def _get_domain_knowledge(career_name):
    """Returns course/cert/project knowledge for a career. Falls back to _default."""
    domain_key = CAREER_DOMAIN_MAP.get(career_name, None)
    if domain_key and domain_key in DOMAIN_KNOWLEDGE:
        return DOMAIN_KNOWLEDGE[domain_key]
    return DOMAIN_KNOWLEDGE["_default"]


# ═══════════════════════════════════════════════════════════════════════
# SECTION 3 — Roadmap generation
# ═══════════════════════════════════════════════════════════════════════

def generate_roadmap(career_name, missing_core, weak_supporting):
    """
    Generates a personalized roadmap based on actual skill gaps.
    Tries GPT first with a rich prompt including courses, certs, and projects.
    Falls back to smart rule-based roadmap if GPT unavailable.
    """
    if OPENAI_AVAILABLE:
        try:
            dk = _get_domain_knowledge(career_name)
            prompt = f"""
You are an expert career coach. Create a personalized learning roadmap for someone 
pursuing a career as "{career_name}".

Their missing core skills: {', '.join(missing_core) if missing_core else 'none — they are core-ready'}.
Their weak supporting skills: {', '.join(weak_supporting) if weak_supporting else 'none'}.

Use the following curated resources for this career:
Recommended courses: {', '.join(dk['courses'][:3])}
Relevant certifications: {', '.join(dk['certifications'][:2])}
Project ideas: {', '.join(dk['projects'][:2])}

Return ONLY a valid JSON object with NO markdown, NO explanation, exactly this format:
{{
  "3_month": ["action 1", "action 2", "action 3"],
  "6_month": ["action 1", "action 2", "action 3"]
}}

Rules:
- 3_month: focus on fixing missing core skills, starting a specific course, and a beginner project
- 6_month: focus on certification, a portfolio project, and job readiness
- Each action must be specific, actionable, and mention real course/cert names where relevant
- Speak directly to the user (e.g. "Complete...", "Build...", "Earn...")
- Do NOT include bullet points or numbering inside the strings
"""
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.6
            )
            text = response.choices[0].message.content.strip()
            # Strip markdown code fences if GPT wraps in ```json
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text.strip())
        except Exception:
            pass  # Fall through to smart rule-based

    return _smart_rule_based_roadmap(career_name, missing_core, weak_supporting)


def _smart_rule_based_roadmap(career_name, missing_core, weak_supporting):
    """
    Smart rule-based roadmap using the domain knowledge base.
    Picks specific courses, certifications, and projects based on career.
    Personalizes based on actual skill gaps.
    """
    dk = _get_domain_knowledge(career_name)

    courses  = dk["courses"]
    certs    = dk["certifications"]
    projects = dk["projects"]

    three_month = []
    six_month   = []

    # ── 3-Month Plan ─────────────────────────────────────────────────

    # Step 1: Fix missing core skills with a specific course
    if missing_core:
        gap_str = " and ".join(s.replace("_", " ") for s in missing_core[:2])
        three_month.append(
            f"Focus on building {gap_str} — start with: {courses[0]}"
        )
    else:
        three_month.append(
            f"Deepen your existing skills with: {courses[0]}"
        )

    # Step 2: Second course or address weak skills
    if weak_supporting and len(courses) > 1:
        weak_str = " and ".join(s.replace("_", " ") for s in weak_supporting[:2])
        three_month.append(
            f"Strengthen {weak_str} alongside: {courses[1]}"
        )
    elif len(courses) > 1:
        three_month.append(f"Expand your knowledge with: {courses[1]}")

    # Step 3: Beginner project
    three_month.append(f"Build your first project: {projects[0]}")

    # ── 6-Month Plan ─────────────────────────────────────────────────

    # Step 1: Certification
    six_month.append(
        f"Earn a recognized certification: {certs[0]}"
    )

    # Step 2: Portfolio project
    if len(projects) > 1:
        six_month.append(f"Build a portfolio-worthy project: {projects[1]}")
    else:
        six_month.append(f"Expand on your first project and document it as a portfolio piece")

    # Step 3: Second cert or advanced step
    if len(certs) > 1:
        six_month.append(
            f"Work towards: {certs[1]} — then start applying and interviewing for {career_name} roles"
        )
    else:
        six_month.append(
            f"Polish your portfolio and actively apply for {career_name} roles"
        )

    return {
        "3_month": three_month,
        "6_month": six_month,
    }
