from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='recruiter')
    company = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    jobs = db.relationship('Job', backref='recruiter', lazy=True, cascade='all, delete-orphan')
    resumes = db.relationship('Resume', backref='uploader', lazy=True, cascade='all, delete-orphan')

class CandidateProfile(db.Model):
    __tablename__ = 'candidate_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    phone = db.Column(db.String(50))
    location = db.Column(db.String(255))
    job_title = db.Column(db.String(255))
    github_url = db.Column(db.String(255))
    portfolio_url = db.Column(db.String(255))
    skills = db.Column(db.JSON, default=list)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('profile', uselist=False))

class Job(db.Model):
    __tablename__ = 'jobs'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    required_skills = db.Column(db.JSON, default=list)
    experience_years = db.Column(db.String(50))
    location = db.Column(db.String(255))
    salary_range = db.Column(db.String(100))
    recruiter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='open')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    resumes = db.relationship('Resume', backref='job', lazy=True, cascade='all, delete-orphan')
    screening_notes = db.relationship('ScreeningNote', backref='job', lazy=True)
    fairness_logs = db.relationship('FairnessLog', backref='job', lazy=True)

class Resume(db.Model):
    __tablename__ = 'resumes'
    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String(255))
    file_path = db.Column(db.String(500))
    candidate_name = db.Column(db.String(255), nullable=False)
    candidate_email = db.Column(db.String(255))
    candidate_phone = db.Column(db.String(20))
    
    skills = db.Column(db.JSON, default=list)
    experience_years = db.Column(db.Integer)
    education = db.Column(db.Text)
    
    match_score = db.Column(db.Float, default=0)
    rank = db.Column(db.Integer)
    status = db.Column(db.String(20), default='new')
    
    candidate_gender = db.Column(db.String(50))
    candidate_age_group = db.Column(db.String(50))
    candidate_education_level = db.Column(db.String(50))
    candidate_location = db.Column(db.String(255))
    
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    uploader_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    scored_at = db.Column(db.DateTime)
    ai_analysis = db.Column(db.JSON) 
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ScreeningNote(db.Model):
    __tablename__ = 'screening_notes'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer)
    resume_id = db.Column(db.Integer, db.ForeignKey('resumes.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class FairnessLog(db.Model):
    __tablename__ = 'fairness_logs'
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    gender_bias_score = db.Column(db.Float)
    age_bias_score = db.Column(db.Float)
    education_bias_score = db.Column(db.Float)
    gender_diversity = db.Column(db.Float)
    age_diversity = db.Column(db.Float)
    education_diversity = db.Column(db.Float)
    overall_fairness_score = db.Column(db.Float)
    gender_bias_alert = db.Column(db.Boolean, default=False)
    age_bias_alert = db.Column(db.Boolean, default=False)
    education_bias_alert = db.Column(db.Boolean, default=False)
    recommendations = db.Column(db.JSON, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    performed_by = db.Column(db.String(255))
    affected_resource_type = db.Column(db.String(50))
    affected_resource_id = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)