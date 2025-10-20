from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    trees_planted = db.Column(db.Integer, default=0)
    eco_points = db.Column(db.Integer, default=0)
    role = db.Column(db.String(20), default='user')  # user, admin, moderator
    
    # Add relationships here if needed
    # trees = db.relationship('Tree', backref='planter', lazy=True)
    
    def __repr__(self):
        return f'<User {self.username}>'