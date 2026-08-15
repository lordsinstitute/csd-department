"""
Database Models — Skill 2 Career
User accounts + Analysis history using SQLite + SQLAlchemy
"""

from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import json

db = SQLAlchemy()


class User(UserMixin, db.Model):
    """User account model."""
    __tablename__ = 'users'

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100), nullable=False)
    email      = db.Column(db.String(150), unique=True, nullable=False)
    password   = db.Column(db.String(256), nullable=False)
    education  = db.Column(db.String(100), default='')
    experience = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to history
    analyses   = db.relationship('AnalysisHistory', backref='user',
                                 lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def __repr__(self):
        return f'<User {self.email}>'


class AnalysisHistory(db.Model):
    """Stores each analysis run by a user."""
    __tablename__ = 'analysis_history'

    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    run_at       = db.Column(db.DateTime, default=datetime.utcnow)

    # Store top career results as JSON
    careers_json = db.Column(db.Text, nullable=False)

    # Top match summary (for quick display in history list)
    top_career   = db.Column(db.String(100), nullable=False)
    top_percent  = db.Column(db.Float, nullable=False)

    @property
    def careers(self):
        return json.loads(self.careers_json)

    @careers.setter
    def careers(self, value):
        self.careers_json = json.dumps(value)

    @property
    def run_at_formatted(self):
        return self.run_at.strftime('%d %b %Y, %I:%M %p')

    def __repr__(self):
        return f'<History user={self.user_id} top={self.top_career}>'