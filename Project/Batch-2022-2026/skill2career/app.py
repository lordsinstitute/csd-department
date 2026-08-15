import json
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_login import LoginManager, login_required, current_user
from models import db, User, AnalysisHistory
from auth import auth as auth_blueprint
from data.career_data import CAREER_MATRIX, SKILL_LIST, SKILL_DOMAINS
from core.similarity_engine import rank_careers
from core.skill_vector import normalize_skills
from core.gap_analyzer import analyze_gap
from core.ai_engine import generate_explanation, generate_roadmap
from core.ml_engine import get_model

app = Flask(__name__)
app.secret_key = "skill2career_secret_key_2024"

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "auth.login"
login_manager.login_message = "Please log in to access this page."
login_manager.login_message_category = "info"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

app.register_blueprint(auth_blueprint)

with app.app_context():
    db.create_all()
    try:
        get_model(CAREER_MATRIX, SKILL_LIST)
    except Exception as e:
        print(f"Warning: ML model init failed ({e}). Will use cosine similarity.")


# Root → about
@app.route("/")
def index():
    return redirect(url_for("about"))


@app.route("/about")
def about():
    return render_template("about.html")


# Skills selection — no personal info fields, pulled from current_user
@app.route("/profile")
@login_required
def profile():
    return render_template("profile.html", skill_domains=SKILL_DOMAINS)


@app.route("/dashboard", methods=["POST"])
@login_required
def dashboard():
    form       = request.form
    name       = current_user.name
    education  = current_user.education
    experience = current_user.experience

    user_input = {}
    for skill in SKILL_LIST:
        val = form.get(skill, 0)
        try:
            user_input[skill] = int(val)
        except (ValueError, TypeError):
            user_input[skill] = 0

    user_vector = normalize_skills(user_input, SKILL_LIST)
    ranked      = rank_careers(user_vector, CAREER_MATRIX, SKILL_LIST, user_input_raw=user_input)
    top_careers = ranked[:10]

    careers = []
    for i, (career_name, similarity) in enumerate(top_careers):
        gap           = analyze_gap(user_input, career_name, CAREER_MATRIX)
        match_percent = gap["readiness_percent"]
        missing_core  = gap["missing_core_skills"]
        weak_sup      = gap["weak_supporting_skills"]

        explanation = generate_explanation(career_name, match_percent, missing_core, weak_sup, user_input)
        roadmap     = generate_roadmap(career_name, missing_core, weak_sup)

        career_skills = CAREER_MATRIX.get(career_name, {})
        level_labels  = {5: "Expert Level", 4: "Advanced Level", 3: "Proficient Level"}
        strong_skills = []
        for skill, importance in career_skills.items():
            if importance == 2:
                score = user_input.get(skill, 0)
                if score >= 3:
                    strong_skills.append({
                        "name":  skill.replace("_", " ").title(),
                        "score": score,
                        "level": level_labels.get(score, "Proficient Level"),
                    })
        strong_skills = sorted(strong_skills, key=lambda x: -x["score"])[:4]

        careers.append({
            "title":           career_name,
            "match_percent":   match_percent,
            "similarity":      round(float(similarity), 3),
            "explanation":     explanation,
            "missing_core":    missing_core,
            "weak_supporting": weak_sup,
            "roadmap":         roadmap,
            "strong_skills":   strong_skills,
            "is_most_matched": False,
        })

    careers.sort(key=lambda x: x["match_percent"], reverse=True)
    careers = careers[:5]
    for i, c in enumerate(careers):
        c["is_most_matched"] = (i == 0)

    session["careers"]    = careers
    session["user_input"] = user_input
    session["name"]       = name

    try:
        history = AnalysisHistory(
            user_id     = current_user.id,
            top_career  = careers[0]["title"],
            top_percent = careers[0]["match_percent"],
        )
        history.careers = careers
        db.session.add(history)
        db.session.commit()
    except Exception as e:
        print(f"History save failed: {e}")

    return redirect(url_for("results"))


@app.route("/dashboard", methods=["GET"])
def dashboard_get():
    return redirect(url_for("profile"))


@app.route("/results")
@login_required
def results():
    careers    = session.get("careers", [])
    user_input = session.get("user_input", {})
    name       = session.get("name", current_user.name)
    if not careers:
        return redirect(url_for("profile"))
    return render_template("dashboard.html", name=name, careers=careers,
                           careers_json=json.dumps(careers),
                           user_skills_json=json.dumps(user_input))


@app.route("/compare")
@login_required
def compare():
    careers    = session.get("careers", [])
    user_input = session.get("user_input", {})
    name       = session.get("name", current_user.name)
    if not careers:
        return redirect(url_for("profile"))
    return render_template("compare.html", name=name, careers=careers,
                           careers_json=json.dumps(careers),
                           user_skills_json=json.dumps(user_input),
                           career_matrix_json=json.dumps(CAREER_MATRIX))


@app.route("/print")
@login_required
def print_report():
    careers    = session.get("careers", [])
    user_input = session.get("user_input", {})
    name       = session.get("name", current_user.name)
    if not careers:
        return redirect(url_for("profile"))
    date = datetime.now().strftime("%d %B %Y, %I:%M %p")
    return render_template("print_report.html", name=name, careers=careers,
                           user_input=user_input, date=date)


@app.route("/print-compare")
@login_required
def print_compare():
    careers    = session.get("careers", [])
    user_input = session.get("user_input", {})
    name       = session.get("name", current_user.name)
    if not careers:
        return redirect(url_for("profile"))
    date = datetime.now().strftime("%d %B %Y, %I:%M %p")
    return render_template("print_compare.html", name=name, careers=careers,
                           user_input=user_input, date=date,
                           career_matrix_json=json.dumps(
                               {c["title"]: CAREER_MATRIX.get(c["title"], {}) for c in careers}))


@app.route("/user-profile", methods=["GET", "POST"])
@login_required
def user_profile():
    if request.method == "POST":
        action = request.form.get("action")
        if action == "update":
            current_user.name       = request.form.get("name", current_user.name).strip()
            current_user.education  = request.form.get("education", current_user.education)
            current_user.experience = int(request.form.get("experience", 0) or 0)
            db.session.commit()
            flash("Profile updated successfully!", "success")
        elif action == "change_password":
            old_pw  = request.form.get("old_password", "")
            new_pw  = request.form.get("new_password", "")
            confirm = request.form.get("confirm_password", "")
            if not current_user.check_password(old_pw):
                flash("Current password is incorrect.", "error")
            elif new_pw != confirm:
                flash("New passwords do not match.", "error")
            elif len(new_pw) < 6:
                flash("Password must be at least 6 characters.", "error")
            else:
                current_user.set_password(new_pw)
                db.session.commit()
                flash("Password changed successfully!", "success")
        elif action == "delete_account":
            db.session.delete(current_user)
            db.session.commit()
            session.clear()
            flash("Your account has been deleted.", "info")
            return redirect(url_for("auth.login"))
        return redirect(url_for("user_profile"))

    history = AnalysisHistory.query.filter_by(user_id=current_user.id)\
                .order_by(AnalysisHistory.run_at.desc()).limit(5).all()
    return render_template("user_profile.html", user=current_user, history=history)


@app.route("/history")
@login_required
def history():
    all_history = AnalysisHistory.query.filter_by(user_id=current_user.id)\
                    .order_by(AnalysisHistory.run_at.desc()).all()
    return render_template("history.html", history=all_history)


@app.route("/history/<int:history_id>")
@login_required
def history_detail(history_id):
    record = AnalysisHistory.query.get_or_404(history_id)
    if record.user_id != current_user.id:
        flash("Access denied.", "error")
        return redirect(url_for("history"))
    careers = record.careers
    session["careers"]    = careers
    session["user_input"] = {}
    session["name"]       = current_user.name
    return redirect(url_for("results"))


@app.route("/history/delete/<int:history_id>", methods=["POST"])
@login_required
def delete_history(history_id):
    record = AnalysisHistory.query.get_or_404(history_id)
    if record.user_id != current_user.id:
        flash("Access denied.", "error")
        return redirect(url_for("history"))
    db.session.delete(record)
    db.session.commit()
    flash("Analysis deleted.", "info")
    return redirect(url_for("history"))


if __name__ == "__main__":
    app.run(debug=True)
