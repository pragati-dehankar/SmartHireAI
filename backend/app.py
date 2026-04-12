# app.py
# ==================================================================================
# SMART HIRE AI - COMPLETE BACKEND WITH BERT MODEL AND ALL FEATURES
# ==================================================================================
# Save this file as: app.py
# This is your complete, ready-to-use backend application
# Features: BERT Scoring, Bias Detection, Fairness Metrics, Analytics, XAI, etc.
# ==================================================================================

import os
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, List, Any
import json
import logging

# ==================== IMPORTS ====================
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import jwt
import PyPDF2
import docx
import io

# ML/AI Imports
from transformers import AutoTokenizer, AutoModel
import torch
import numpy as np
from collections import Counter

# ==================== LOGGING SETUP ====================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== FLASK APP SETUP ====================
app = Flask(__name__)
CORS(app)

# ==================== CONFIGURATION ====================
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:root@localhost:5432/smart_hire_ai'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_SECRET'] = 'your-jwt-secret-change-in-production'
app.config['JWT_ALGORITHM'] = 'HS256'
app.config['JWT_EXPIRATION'] = 604800  # 7 days

# BERT Configuration
BERT_MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2'
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Fairness Thresholds
GENDER_BIAS_THRESHOLD = 0.3
AGE_BIAS_THRESHOLD = 0.3
EDUCATION_BIAS_THRESHOLD = 0.3

# Create upload folder
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ==================== DATABASE SETUP ====================
db = SQLAlchemy(app)

# ==================== DATABASE MODELS ====================

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

# ==================== BERT SERVICE ====================

class BertService:
    def __init__(self, model_name: str = BERT_MODEL_NAME):
        self.model_name = model_name
        self.tokenizer = None
        self.model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Loading BERT model: {model_name}")
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModel.from_pretrained(model_name)
            self.model.to(self.device)
            self.model.eval()
            logger.info("✅ BERT model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading BERT model: {str(e)}")
            raise
    
    def get_embedding(self, text: str) -> np.ndarray:
        if not text or len(text.strip()) == 0:
            return np.zeros(384)
        
        try:
            inputs = self.tokenizer(
                text[:512],
                return_tensors="pt",
                truncation=True,
                padding=True
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = self.model(**inputs)
            
            embedding = outputs.last_hidden_state[:, 0, :].cpu().numpy()
            return embedding[0]
        except Exception as e:
            logger.error(f"Error getting embedding: {str(e)}")
            return np.zeros(384)
    
    @staticmethod
    def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
        dot_product = np.dot(vec1, vec2)
        norm_a = np.linalg.norm(vec1)
        norm_b = np.linalg.norm(vec2)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        return float(dot_product / (norm_a * norm_b))
    
    def score_resume(self, resume_text: str, job_description: str) -> Dict:
        try:
            resume_embedding = self.get_embedding(resume_text)
            job_embedding = self.get_embedding(job_description)
            
            overall_score = self.cosine_similarity(resume_embedding, job_embedding)
            
            sections = self._extract_sections(resume_text)
            
            skills_score = self.cosine_similarity(
                self.get_embedding(sections['skills']),
                job_embedding
            ) if sections['skills'] else overall_score
            
            experience_score = self.cosine_similarity(
                self.get_embedding(sections['experience']),
                job_embedding
            ) if sections['experience'] else overall_score
            
            final_score = (
                overall_score * 0.4 +
                skills_score * 0.35 +
                experience_score * 0.25
            ) * 100
            
            extracted_skills = self._extract_skills(resume_text)
            
            return {
                'matchScore': round(final_score),
                'overallSimilarity': round(overall_score * 100, 2),
                'skillsMatch': round(skills_score * 100, 2),
                'experienceMatch': round(experience_score * 100, 2),
                'extractedSkills': extracted_skills,
                'confidence': round((skills_score + experience_score) / 2 * 100, 2),
                'recommendation': self._get_recommendation(final_score)
            }
        except Exception as e:
            logger.error(f"Error scoring resume: {str(e)}")
            return {
                'matchScore': 0,
                'overallSimilarity': 0,
                'skillsMatch': 0,
                'experienceMatch': 0,
                'extractedSkills': [],
                'confidence': 0,
                'error': str(e)
            }
    
    @staticmethod
    def _extract_sections(text: str) -> Dict:
        text_lower = text.lower()
        sections = {'skills': '', 'experience': '', 'education': '', 'full_text': text}
        
        skills_idx = text_lower.find('skill')
        if skills_idx != -1:
            next_section = min([
                text_lower.find('experience', skills_idx + 1),
                text_lower.find('education', skills_idx + 1),
                len(text)
            ])
            sections['skills'] = text[skills_idx:next_section]
        
        exp_idx = text_lower.find('experience')
        if exp_idx != -1:
            next_section = min([text_lower.find('education', exp_idx + 1), len(text)])
            sections['experience'] = text[exp_idx:next_section]
        
        edu_idx = text_lower.find('education')
        if edu_idx != -1:
            sections['education'] = text[edu_idx:]
        
        return sections
    
    @staticmethod
    def _extract_skills(text: str) -> List[str]:
        skills_keywords = [
            'python', 'javascript', 'java', 'c++', 'golang', 'rust', 'typescript',
            'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
            'fastapi', 'spring', 'sql', 'mongodb', 'postgresql', 'mysql',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'jenkins',
            'rest api', 'graphql', 'microservices', 'ci/cd', 'agile', 'scrum'
        ]
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in skills_keywords:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        return list(set(found_skills))
    
    @staticmethod
    def _get_recommendation(score: float) -> str:
        if score >= 85:
            return "Highly recommended - Strong match"
        elif score >= 70:
            return "Recommended - Good match"
        elif score >= 50:
            return "Consider - Moderate match"
        else:
            return "Not recommended - Minimal match"

bert_service = None

def get_bert_service():
    global bert_service
    if bert_service is None:
        bert_service = BertService()
    return bert_service

# ==================== FAIRNESS SERVICE ====================

class FairnessService:
    def __init__(self, gender_threshold: float = 0.3, age_threshold: float = 0.3, education_threshold: float = 0.3):
        self.gender_threshold = gender_threshold
        self.age_threshold = age_threshold
        self.education_threshold = education_threshold
    
    def analyze_fairness(self, resumes: List[Dict]) -> Dict:
        try:
            if not resumes:
                return self._empty_fairness_report()
            
            genders = [r.get('candidate_gender') for r in resumes if r.get('candidate_gender')]
            ages = [r.get('candidate_age_group') for r in resumes if r.get('candidate_age_group')]
            educations = [r.get('candidate_education_level') for r in resumes if r.get('candidate_education_level')]
            scores = [r.get('match_score', 0) for r in resumes]
            
            gender_diversity = self._calculate_diversity(genders)
            age_diversity = self._calculate_diversity(ages)
            education_diversity = self._calculate_diversity(educations)
            
            gender_bias = self._detect_bias(genders, scores)
            age_bias = self._detect_bias(ages, scores)
            education_bias = self._detect_bias(educations, scores)
            
            overall_fairness = (
                (1.0 - (gender_bias + age_bias + education_bias) / 3.0) * 0.6 +
                (gender_diversity + age_diversity + education_diversity) / 3.0 * 0.4
            ) * 100
            
            alerts = self._generate_alerts(gender_bias, age_bias, education_bias)
            
            return {
                'genderDiversity': round(gender_diversity * 100, 2),
                'ageDiversity': round(age_diversity * 100, 2),
                'educationDiversity': round(education_diversity * 100, 2),
                'genderBiasScore': round(gender_bias, 3),
                'ageBiasScore': round(age_bias, 3),
                'educationBiasScore': round(education_bias, 3),
                'overallFairnessScore': round(overall_fairness, 2),
                'alerts': alerts,
                'summary': f"Fairness Score: {overall_fairness:.1f}%"
            }
        except Exception as e:
            logger.error(f"Error analyzing fairness: {str(e)}")
            return self._empty_fairness_report()
    
    @staticmethod
    def _calculate_diversity(values: List[str]) -> float:
        if not values or len(values) == 0:
            return 0.0
        
        counter = Counter(values)
        n = len(values)
        diversity = 1.0
        
        for count in counter.values():
            diversity -= (count / n) ** 2
        
        return min(diversity, 1.0)
    
    @staticmethod
    def _detect_bias(categories: List[str], scores: List[float]) -> float:
        if len(categories) < 2 or not scores:
            return 0.0
        
        category_scores = {}
        for cat, score in zip(categories, scores):
            if cat not in category_scores:
                category_scores[cat] = []
            category_scores[cat].append(score)
        
        avg_scores = {cat: np.mean(scores) for cat, scores in category_scores.items()}
        
        if len(avg_scores) < 2:
            return 0.0
        
        scores_list = list(avg_scores.values())
        bias = np.std(scores_list) / (np.mean(scores_list) + 0.001)
        
        return min(bias, 1.0)
    
    def _generate_alerts(self, gender_bias, age_bias, education_bias) -> List[str]:
        alerts = []
        if gender_bias > self.gender_threshold:
            alerts.append(f"⚠️ Gender bias detected (score: {gender_bias:.2f})")
        if age_bias > self.age_threshold:
            alerts.append(f"⚠️ Age bias detected (score: {age_bias:.2f})")
        if education_bias > self.education_threshold:
            alerts.append(f"⚠️ Education bias detected (score: {education_bias:.2f})")
        return alerts
    
    @staticmethod
    def _empty_fairness_report() -> Dict:
        return {
            'genderDiversity': 0,
            'ageDiversity': 0,
            'educationDiversity': 0,
            'genderBiasScore': 0,
            'ageBiasScore': 0,
            'educationBiasScore': 0,
            'overallFairnessScore': 0,
            'alerts': [],
            'summary': 'Insufficient data'
        }

fairness_service = FairnessService()



# ==================== ROOT ROUTE (ADD THIS) ====================

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "🚀 SmartHire AI Backend Running",
        "status": "success",
        "available_endpoints": [
            "/api/health",
            "/api/auth/register",
            "/api/auth/login",
            "/api/jobs",
            "/api/resumes/upload",
            "/api/analytics/system"
        ]
    }), 200
# ==================== EXPLAINABILITY SERVICE ====================

class ExplainabilityService:
    @staticmethod
    def explain_score(resume_data: Dict, job_data: Dict, scores: Dict) -> Dict:
        match_score = scores.get('matchScore', 0)
        
        return {
            'matchScore': match_score,
            'mainReasons': ExplainabilityService._get_main_reasons(match_score, scores),
            'strengths': ExplainabilityService._identify_strengths(scores),
            'gaps': ExplainabilityService._identify_gaps(resume_data, job_data),
            'recommendation': ExplainabilityService._get_recommendation(match_score),
            'confidence': scores.get('confidence', 0),
            'nextSteps': ExplainabilityService._suggest_next_steps(match_score)
        }
    
    @staticmethod
    def _get_main_reasons(score: float, scores: Dict) -> List[str]:
        reasons = []
        if scores.get('skillsMatch', 0) > scores.get('experienceMatch', 0):
            reasons.append(f"Strong skills match ({scores.get('skillsMatch', 0):.0f}%)")
        else:
            reasons.append(f"Solid experience match ({scores.get('experienceMatch', 0):.0f}%)")
        
        if score >= 80:
            reasons.append("High overall compatibility")
        elif score >= 60:
            reasons.append("Moderate fit with some gaps")
        else:
            reasons.append("Significant skill/experience gaps")
        
        return reasons
    
    @staticmethod
    def _identify_strengths(scores: Dict) -> List[str]:
        strengths = []
        if scores.get('skillsMatch', 0) >= 75:
            strengths.append("Excellent skills match")
        if scores.get('experienceMatch', 0) >= 75:
            strengths.append("Relevant experience level")
        if scores.get('overallSimilarity', 0) >= 75:
            strengths.append("Strong overall alignment")
        return strengths
    
    @staticmethod
    def _identify_gaps(resume_data: Dict, job_data: Dict) -> List[str]:
        gaps = []
        resume_skills = [s.lower() for s in resume_data.get('skills', [])]
        required_skills = [s.lower() for s in job_data.get('required_skills', [])]
        missing = [s for s in required_skills if s not in resume_skills]
        
        if missing:
            gaps.extend([f"Missing {s} skill" for s in missing[:3]])
        
        return gaps
    
    @staticmethod
    def _get_recommendation(score: float) -> str:
        if score >= 85:
            return "Highly recommended - Fast-track for interview"
        elif score >= 70:
            return "Recommended - Schedule technical interview"
        elif score >= 50:
            return "Consider - Phone screening recommended"
        else:
            return "Not recommended - Low match"
    
    @staticmethod
    def _suggest_next_steps(score: float) -> List[str]:
        if score >= 80:
            return ["1. Schedule technical interview", "2. Verify references", "3. Prepare offer discussion"]
        elif score >= 60:
            return ["1. Conduct phone screening", "2. Technical assessment", "3. Decision meeting"]
        else:
            return ["1. Review gaps with candidate", "2. Consider for junior role", "3. Keep in talent pool"]

explainability_service = ExplainabilityService()

# ==================== ANALYTICS SERVICE ====================

class AnalyticsService:
    @staticmethod
    def get_job_analytics(job, resumes: List) -> Dict:
        if not resumes:
            return {
                'totalCandidates': 0,
                'averageScore': 0,
                'topScore': 0,
                'bottomScore': 0,
                'topCandidates': [],
                'topSkills': [],
                'summary': 'No data'
            }
        
        scores = [r.match_score for r in resumes if r.match_score > 0]
        
        if not scores:
            return {
                'totalCandidates': len(resumes),
                'averageScore': 0,
                'topScore': 0,
                'bottomScore': 0,
                'topCandidates': [],
                'topSkills': [],
                'summary': 'Resumes not yet scored'
            }
        
        return {
            'totalCandidates': len(resumes),
            'scoredCandidates': len(scores),
            'averageScore': round(np.mean(scores), 2),
            'medianScore': round(np.median(scores), 2),
            'topScore': round(np.max(scores), 2),
            'bottomScore': round(np.min(scores), 2),
            'stdDeviation': round(np.std(scores), 2),
            'scoreDistribution': AnalyticsService._get_distribution(scores),
            'topCandidates': AnalyticsService._get_top_candidates(resumes, 5),
            'topSkills': AnalyticsService._get_top_skills(resumes),
            'qualificationRate': round((len([s for s in scores if s >= 60]) / len(scores) * 100), 2)
        }
    
    @staticmethod
    def _get_distribution(scores: List[float]) -> Dict:
        return {
            '80-100': len([s for s in scores if 80 <= s <= 100]),
            '60-79': len([s for s in scores if 60 <= s < 80]),
            '40-59': len([s for s in scores if 40 <= s < 60]),
            '0-39': len([s for s in scores if s < 40])
        }
    
    @staticmethod
    def _get_top_candidates(resumes: List, limit: int = 5) -> List[Dict]:
        sorted_resumes = sorted(resumes, key=lambda x: x.match_score, reverse=True)
        return [
            {
                'name': r.candidate_name,
                'email': r.candidate_email,
                'score': round(r.match_score, 2),
                'rank': i + 1
            }
            for i, r in enumerate(sorted_resumes[:limit])
        ]
    
    @staticmethod
    def _get_top_skills(resumes: List, limit: int = 10) -> List[Dict]:
        all_skills = []
        for resume in resumes:
            all_skills.extend(resume.skills or [])
        
        skill_counts = Counter(all_skills)
        return [
            {'skill': skill, 'count': count}
            for skill, count in skill_counts.most_common(limit)
        ]

analytics_service = AnalyticsService()

# ==================== HELPER FUNCTIONS ====================

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def anonymize_text(text):
    """Deeply anonymize resume text to ensure background fairness."""
    import re
    # Remove Emails
    text = re.sub(r'\S+@\S+', '[EMAIL_REDACTED]', text)
    # Remove Phone Numbers
    text = re.sub(r'\b\d{10}\b|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE_REDACTED]', text)
    # Remove common Name indicators but keep skills (simple version)
    lines = text.split('\n')
    if lines:
        lines[0] = "[CANDIDATE_NAME_REDACTED]" # Usually name is on first line
    return '\n'.join(lines)

def extract_text(file_path):
    ext = file_path.rsplit('.', 1)[1].lower()
    text = ""
    try:
        if ext == 'pdf':
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() or ""
        elif ext in ['doc', 'docx']:
            doc = docx.Document(file_path)
            text = "\n".join([para.text for para in doc.paragraphs])
        else:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
    except Exception as e:
        logger.error(f"Error extracting text from {file_path}: {str(e)}")
        return ""
    return text

def create_token(user_id: int, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(seconds=app.config['JWT_EXPIRATION'])
    }
    return jwt.encode(payload, app.config['JWT_SECRET'], algorithm=app.config['JWT_ALGORITHM'])

def verify_token(token: str) -> Dict:
    try:
        return jwt.decode(token, app.config['JWT_SECRET'], algorithms=[app.config['JWT_ALGORITHM']])
    except:
        return None

# ==================== DECORATORS ====================

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        data = verify_token(token)
        if not data:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        request.user_id = data['user_id']
        request.user_email = data['email']
        
        return f(*args, **kwargs)
    
    return decorated

# ==================== ROUTES - HEALTH ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'features': {
            'bert_scoring': True,
            'bias_detection': True,
            'fairness_metrics': True,
            'explainable_ai': True,
            'analytics': True
        }
    }), 200

# ==================== ROUTES - AUTHENTICATION ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['email', 'password', 'name']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'User already exists'}), 400
        
        user = User(
            email=data['email'],
            name=data['name'],
            password=generate_password_hash(data['password']),
            company=data.get('company', ''),
            role=data.get('role', 'recruiter')
        )
        
        db.session.add(user)
        db.session.commit()
        
        token = create_token(user.id, user.email)
        
        audit = AuditLog(
            action='user_registered',
            description=f'User {user.email} registered',
            performed_by=user.email,
            affected_resource_type='User',
            affected_resource_id=user.id
        )
        db.session.add(audit)
        db.session.commit()
        
        logger.info(f"User registered: {user.email}")
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'company': user.company,
                'role': user.role
            }
        }), 201
    
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['email', 'password']):
            return jsonify({'error': 'Missing credentials'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not check_password_hash(user.password, data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        token = create_token(user.id, user.email)
        
        audit = AuditLog(
            action='user_login',
            description=f'User {user.email} logged in',
            performed_by=user.email,
            affected_resource_type='User',
            affected_resource_id=user.id
        )
        db.session.add(audit)
        db.session.commit()
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'company': user.company,
                'role': user.role
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/profile', methods=['GET'])
@token_required
def get_profile():
    try:
        user = User.query.get(request.user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'company': user.company,
            'role': user.role,
            'created_at': user.created_at.isoformat()
        }), 200
    
    except Exception as e:
        logger.error(f"Profile error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ==================== ROUTES - CANDIDATE ====================

@app.route('/api/candidate/profile', methods=['GET', 'POST'])
@token_required
def candidate_profile():
    try:
        user = User.query.get(request.user_id)
        if not user or user.role != 'candidate':
            return jsonify({'error': 'Unauthorized. Must be a candidate.'}), 403
            
        profile = CandidateProfile.query.filter_by(user_id=user.id).first()
        
        if request.method == 'GET':
            if not profile:
                return jsonify({
                    'name': user.name,
                    'email': user.email,
                    'phone': '',
                    'location': '',
                    'jobTitle': ''
                }), 200
            return jsonify({
                'name': user.name,
                'email': user.email,
                'phone': profile.phone or '',
                'location': profile.location or '',
                'jobTitle': profile.job_title or ''
            }), 200
            
        elif request.method == 'POST':
            data = request.get_json()
            if not profile:
                profile = CandidateProfile(user_id=user.id)
                db.session.add(profile)
            
            # Update User base model fields if they changed them
            if 'name' in data:
                user.name = data['name']
            
            # Update Profile fields
            profile.phone = data.get('phone', profile.phone)
            profile.location = data.get('location', profile.location)
            profile.job_title = data.get('jobTitle', profile.job_title)
            
            db.session.commit()
            return jsonify({'message': 'Profile updated successfully'}), 200

    except Exception as e:
        logger.error(f"Candidate profile error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== ROUTES - JOBS ====================

@app.route('/api/jobs', methods=['POST'])
@token_required
def create_job():
    try:
        data = request.get_json()
        
        if not data or 'title' not in data or 'description' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        job = Job(
            title=data['title'],
            description=data['description'],
            required_skills=data.get('required_skills', []),
            experience_years=data.get('experience_years'),
            location=data.get('location'),
            salary_range=data.get('salary_range'),
            recruiter_id=request.user_id
        )
        
        db.session.add(job)
        db.session.commit()
        
        audit = AuditLog(
            action='job_created',
            description=f'Job {job.title} created',
            performed_by=request.user_email,
            affected_resource_type='Job',
            affected_resource_id=job.id
        )
        db.session.add(audit)
        db.session.commit()
        
        logger.info(f"Job created: {job.title} by {request.user_email}")
        
        return jsonify({
            'message': 'Job created successfully',
            'job': {
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'required_skills': job.required_skills,
                'created_at': job.created_at.isoformat()
            }
        }), 201
    
    except Exception as e:
        logger.error(f"Job creation error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs', methods=['GET'])
@token_required
def list_jobs():
    try:
        jobs = Job.query.filter_by(recruiter_id=request.user_id).all()
        
        jobs_data = []
        for job in jobs:
            resume_count = Resume.query.filter_by(job_id=job.id).count()
            jobs_data.append({
                'id': job.id,
                'title': job.title,
                'description': job.description[:100] + '...',
                'required_skills': job.required_skills,
                'location': job.location,
                'status': job.status,
                'resumes_count': resume_count,
                'created_at': job.created_at.isoformat()
            })
        
        return jsonify(jobs_data), 200
    
    except Exception as e:
        logger.error(f"List jobs error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs/<int:job_id>', methods=['GET'])
@token_required
def get_job(job_id):
    try:
        job = Job.query.get(job_id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        resumes = Resume.query.filter_by(job_id=job_id).all()
        
        return jsonify({
            'id': job.id,
            'title': job.title,
            'description': job.description,
            'required_skills': job.required_skills,
            'experience_years': job.experience_years,
            'location': job.location,
            'salary_range': job.salary_range,
            'status': job.status,
            'total_resumes': len(resumes),
            'avg_score': round(np.mean([r.match_score for r in resumes if r.match_score > 0]), 2) if resumes else 0,
            'created_at': job.created_at.isoformat()
        }), 200
    
    except Exception as e:
        logger.error(f"Get job error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs/<int:job_id>', methods=['PUT'])
@token_required
def update_job(job_id):
    try:
        job = Job.query.get(job_id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        if job.recruiter_id != request.user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        if 'title' in data:
            job.title = data['title']
        if 'description' in data:
            job.description = data['description']
        if 'required_skills' in data:
            job.required_skills = data['required_skills']
        if 'status' in data:
            job.status = data['status']
        
        job.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Job updated successfully'}), 200
    
    except Exception as e:
        logger.error(f"Update job error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
@token_required
def delete_job(job_id):
    try:
        job = Job.query.get(job_id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        if job.recruiter_id != request.user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        db.session.delete(job)
        db.session.commit()
        
        return jsonify({'message': 'Job deleted successfully'}), 200
    
    except Exception as e:
        logger.error(f"Delete job error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== ROUTES - RESUMES ====================

@app.route('/api/resumes/upload', methods=['POST'])
@token_required
def upload_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
        
        file = request.files['resume']
        job_id = request.form.get('jobID')
        candidate_name = request.form.get('candidateName')
        candidate_email = request.form.get('candidateEmail')
        
        if not all([job_id, candidate_name, candidate_email]):
            missing = [f for f, v in [('jobID', job_id), ('candidateName', candidate_name), ('candidateEmail', candidate_email)] if not v]
            logger.error(f"Upload failed: Missing fields {missing}")
            return jsonify({'error': f'Missing required fields: {", ".join(missing)}'}), 400
        
        if not allowed_file(file.filename):
            logger.error(f"Upload failed: File type {file.filename} not allowed")
            return jsonify({'error': 'File type not allowed. Please use PDF, DOCX or TXT'}), 400
        
        filename = secure_filename(file.filename)
        timestamp = int(datetime.utcnow().timestamp())
        filename = f"{timestamp}_{filename}"
        
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        resume = Resume(
            file_name=file.filename,
            file_path=filepath,
            candidate_name=candidate_name,
            candidate_email=candidate_email,
            job_id=int(job_id),
            uploader_id=request.user_id
        )
        
        db.session.add(resume)
        db.session.commit()
        
        audit = AuditLog(
            action='resume_uploaded',
            description=f'Resume uploaded for {candidate_name}',
            performed_by=request.user_email,
            affected_resource_type='Resume',
            affected_resource_id=resume.id
        )
        db.session.add(audit)
        db.session.commit()
        
        logger.info(f"Resume uploaded: {resume.id}")
        
        return jsonify({
            'message': 'Resume uploaded successfully',
            'resumeId': resume.id,
            'fileName': file.filename
        }), 201
    
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/resumes/<int:resume_id>/score', methods=['POST'])
@token_required
def score_resume(resume_id):
    try:
        resume = Resume.query.get(resume_id)
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        job = Job.query.get(resume.job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        try:
            resume_text = extract_text(resume.file_path)
            # Apply Anonymization for Fairness
            resume_text = anonymize_text(resume_text)
            
            if not resume_text or len(resume_text.strip()) == 0:
                return jsonify({'error': 'Resume file is empty or could not be parsed'}), 400
        except Exception as e:
            logger.error(f"Text extraction failed: {str(e)}")
            return jsonify({'error': f'Parsing failed: {str(e)}'}), 400
        
        # AI Core - BERT Evaluation
        try:
            bert = get_bert_service()
            scores = bert.score_resume(resume_text, job.description)
        except Exception as be:
            logger.error(f"BERT evaluation failed: {str(be)}")
            return jsonify({'error': f'BERT core error: {str(be)}'}), 500
        
        # XAI - Explainability service
        try:
            explanation = explainability_service.explain_score(
                {
                    'skills': scores.get('extractedSkills', []),
                    'candidate_education_level': resume.candidate_education_level or 'Not specified',
                    'experience_years': resume.experience_years or 0
                },
                {
                    'required_skills': job.required_skills or [],
                    'experience_years': job.experience_years,
                    'description': job.description
                },
                scores
            )
        except Exception as ee:
            logger.error(f"Explainability generation failed: {str(ee)}")
            explanation = {"error": "Explanation unavailable"}
        
        # Update Resume Data
        resume.match_score = scores.get('matchScore', 0)
        resume.skills = scores.get('extractedSkills', [])
        resume.scored_at = datetime.utcnow()
        resume.status = 'reviewed'
        
        # Persistence
        db.session.commit()
        
        # Fairness Analysis
        fairness_report = None
        try:
            all_resumes = Resume.query.filter_by(job_id=job.id).all()
            fairness_data = []
            for r in all_resumes:
                if r.match_score is not None:
                    fairness_data.append({
                        'match_score': r.match_score,
                        'candidate_gender': r.candidate_gender,
                        'candidate_age_group': r.candidate_age_group,
                        'candidate_education_level': r.candidate_education_level,
                        'candidate_location': r.candidate_location,
                        'skills': r.skills or []
                    })
            
            fairness_report = fairness_service.analyze_fairness(fairness_data)
            
            fairness_log = FairnessLog(
                job_id=job.id,
                recruiter_id=request.user_id,
                gender_bias_score=fairness_report.get('genderBiasScore', 0),
                age_bias_score=fairness_report.get('ageBiasScore', 0),
                education_bias_score=fairness_report.get('educationBiasScore', 0),
                gender_diversity=fairness_report.get('genderDiversity', 0) / 100,
                age_diversity=fairness_report.get('ageDiversity', 0) / 100,
                education_diversity=fairness_report.get('educationDiversity', 0) / 100,
                overall_fairness_score=fairness_report.get('overallFairnessScore', 0),
                recommendations=fairness_report
            )
            db.session.add(fairness_log)
            db.session.commit()
        except Exception as fe:
            logger.error(f"Fairness analysis failed: {str(fe)}")
        
        logger.info(f"AI Process complete for resume {resume_id}")
        
        return jsonify({
            'message': 'AI evaluation successful',
            'scores': scores,
            'explanation': explanation,
            'fairness': fairness_report
        }), 200
    
    except Exception as e:
        logger.error(f"Scoring error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/resumes/job/<int:job_id>', methods=['GET'])
@token_required
def get_resumes_by_job(job_id):
    try:
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        resumes = Resume.query.filter_by(job_id=job_id).order_by(Resume.match_score.desc()).all()
        
        resumes_data = []
        for i, resume in enumerate(resumes, 1):
            resumes_data.append({
                'id': resume.id,
                'rank': i,
                'name': resume.candidate_name,
                'email': resume.candidate_email,
                'score': round(resume.match_score, 2),
                'skills': resume.skills or [],
                'status': resume.status,
                'uploaded_at': resume.uploaded_at.isoformat()
            })
        
        return jsonify(resumes_data), 200
    
    except Exception as e:
        logger.error(f"Get resumes error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/resumes/<int:resume_id>', methods=['GET'])
@token_required
def get_resume(resume_id):
    try:
        resume = Resume.query.get(resume_id)
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        return jsonify({
            'id': resume.id,
            'name': resume.candidate_name,
            'email': resume.candidate_email,
            'phone': resume.candidate_phone,
            'score': round(resume.match_score, 2),
            'skills': resume.skills or [],
            'experience_years': resume.experience_years,
            'education': resume.education,
            'status': resume.status,
            'uploaded_at': resume.uploaded_at.isoformat(),
            'scored_at': resume.scored_at.isoformat() if resume.scored_at else None
        }), 200
    
    except Exception as e:
        logger.error(f"Get resume error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/resumes/<int:resume_id>/status', methods=['PUT'])
@token_required
def update_resume_status(resume_id):
    try:
        resume = Resume.query.get(resume_id)
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        data = request.get_json()
        
        if 'status' in data:
            resume.status = data['status']
        
        resume.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Status updated successfully'}), 200
    
    except Exception as e:
        logger.error(f"Update status error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/resumes/<int:resume_id>', methods=['DELETE'])
@token_required
def delete_resume(resume_id):
    try:
        resume = Resume.query.get(resume_id)
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        if os.path.exists(resume.file_path):
            os.remove(resume.file_path)
        
        db.session.delete(resume)
        db.session.commit()
        
        return jsonify({'message': 'Resume deleted successfully'}), 200
    
    except Exception as e:
        logger.error(f"Delete resume error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== ROUTES - ANALYTICS ====================

@app.route('/api/analytics/job/<int:job_id>', methods=['GET'])
@token_required
def get_job_analytics_endpoint(job_id):
    try:
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        resumes = Resume.query.filter_by(job_id=job_id).all()
        
        analytics = analytics_service.get_job_analytics(job, resumes)
        
        return jsonify(analytics), 200
    
    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/system', methods=['GET'])
@token_required
def get_system_analytics():
    try:
        users = User.query.all()
        jobs = Job.query.all()
        resumes = Resume.query.all()
        
        return jsonify({
            'totalUsers': len(users),
            'totalJobs': len(jobs),
            'totalResumes': len(resumes),
            'activeJobs': len([j for j in jobs if j.status == 'open']),
            'scoredResumes': len([r for r in resumes if r.match_score > 0]),
            'averageScore': round(np.mean([r.match_score for r in resumes if r.match_score > 0]), 2) if any(r.match_score > 0 for r in resumes) else 0
        }), 200
    
    except Exception as e:
        logger.error(f"System analytics error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ==================== ROUTES - FAIRNESS ====================

@app.route('/api/fairness/job/<int:job_id>', methods=['GET'])
@token_required
def get_job_fairness(job_id):
    try:
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        resumes = Resume.query.filter_by(job_id=job_id).all()
        
        fairness_data = []
        for r in resumes:
            fairness_data.append({
                'match_score': r.match_score,
                'candidate_gender': r.candidate_gender,
                'candidate_age_group': r.candidate_age_group,
                'candidate_education_level': r.candidate_education_level,
                'candidate_location': r.candidate_location,
                'skills': r.skills or []
            })
        
        fairness = fairness_service.analyze_fairness(fairness_data)
        
        return jsonify(fairness), 200
    
    except Exception as e:
        logger.error(f"Fairness error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

# ==================== MAIN ====================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        logger.info("✅ Database tables created")
        
        try:
            bert = get_bert_service()
            logger.info("✅ BERT model loaded")
        except Exception as e:
            logger.error(f"❌ Error loading BERT model: {str(e)}")
    
    print("\n" + "="*80)
    print("🚀 SMART HIRE AI BACKEND - COMPLETE SYSTEM")
    print("="*80)
    print("✅ Features:")
    print("   • BERT Model Integration")
    print("   • Bias Detection & Fairness Monitoring")
    print("   • Explainable AI (XAI)")
    print("   • Analytics & Reporting")
    print("   • Resume Scoring & Ranking")
    print("   • User Authentication")
    print("   • Job Management")
    print("   • Complete REST API")
    print("="*80)
    print("📍 Server: http://localhost:5000")
    print("🔗 Database: PostgreSQL")
    print("🧠 AI Model: BERT (sentence-transformers)")
    print("="*80 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)