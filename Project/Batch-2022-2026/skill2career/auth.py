"""
Auth Routes — Skill 2 Career
Handles signup, login, logout, forgot/reset password
"""

from flask import Blueprint, render_template, redirect, url_for, request, flash, session
from flask_login import login_user, logout_user, login_required, current_user
from models import db, User

auth = Blueprint('auth', __name__)


@auth.route('/signup', methods=['GET', 'POST'])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('about'))

    if request.method == 'POST':
        name       = request.form.get('name', '').strip()
        email      = request.form.get('email', '').strip().lower()
        password   = request.form.get('password', '')
        confirm    = request.form.get('confirm_password', '')
        education  = request.form.get('education', '')
        experience = int(request.form.get('experience', 0) or 0)

        if not name or not email or not password:
            flash('Please fill in all required fields.', 'error')
            return render_template('signup.html')

        if password != confirm:
            flash('Passwords do not match.', 'error')
            return render_template('signup.html')

        if len(password) < 6:
            flash('Password must be at least 6 characters.', 'error')
            return render_template('signup.html')

        if User.query.filter_by(email=email).first():
            flash('An account with this email already exists.', 'error')
            return render_template('signup.html')

        user = User(
            name=name,
            email=email,
            education=education,
            experience=experience,
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        login_user(user)
        flash(f'Welcome, {name}! Your account has been created.', 'success')
        return redirect(url_for('profile'))

    return render_template('signup.html')


@auth.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('profile'))

    if request.method == 'POST':
        email    = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        remember = request.form.get('remember', False)

        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            flash('Invalid email or password.', 'error')
            return render_template('login.html')

        login_user(user, remember=bool(remember))
        flash(f'Welcome back, {user.name}!', 'success')

        next_page = request.args.get('next')
        return redirect(next_page or url_for('profile'))

    return render_template('login.html')


@auth.route('/logout')
@login_required
def logout():
    session.clear()
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('auth.login'))


# ── Forgot Password (simple — resets via email lookup, no email sending) ──
@auth.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        user  = User.query.filter_by(email=email).first()
        # Always show success message to avoid email enumeration
        flash('If an account with that email exists, a reset link has been sent.', 'success')
        # Store email in session to allow reset on next step
        if user:
            session['reset_email'] = email
            return redirect(url_for('auth.reset_password'))
        return redirect(url_for('auth.forgot_password'))
    return render_template('forgot_password.html')


@auth.route('/reset-password', methods=['GET', 'POST'])
def reset_password():
    email = session.get('reset_email')
    if not email:
        flash('Please enter your email first.', 'error')
        return redirect(url_for('auth.forgot_password'))

    user = User.query.filter_by(email=email).first()
    if not user:
        flash('Account not found.', 'error')
        return redirect(url_for('auth.forgot_password'))

    if request.method == 'POST':
        new_pw  = request.form.get('new_password', '')
        confirm = request.form.get('confirm_password', '')

        if len(new_pw) < 6:
            flash('Password must be at least 6 characters.', 'error')
            return render_template('reset_password.html')

        if new_pw != confirm:
            flash('Passwords do not match.', 'error')
            return render_template('reset_password.html')

        user.set_password(new_pw)
        db.session.commit()
        session.pop('reset_email', None)
        flash('Password reset successfully! Please log in.', 'success')
        return redirect(url_for('auth.login'))

    return render_template('reset_password.html', email=email)
