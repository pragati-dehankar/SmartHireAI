from flask import Blueprint, request, jsonify
from models.database import db, User, CandidateProfile, Resume, Job
from utils.auth import token_required
import logging
from datetime import datetime

candidate_bp = Blueprint('candidate', __name__)
logger = logging.getLogger(__name__)

@candidate_bp.route('/profile', methods=['GET', 'POST'])
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
                'jobTitle': profile.job_title or '',
                'job_title': profile.job_title or '' # Both casing for compatibility
            }), 200
            
        elif request.method == 'POST':
            data = request.get_json()
            if not profile:
                profile = CandidateProfile(user_id=user.id)
                db.session.add(profile)
            
            if 'name' in data:
                user.name = data['name']
            
            profile.phone = data.get('phone', profile.phone)
            profile.location = data.get('location', profile.location)
            profile.job_title = data.get('jobTitle', data.get('job_title', profile.job_title))
            
            db.session.commit()
            return jsonify({'message': 'Profile updated successfully'}), 200

    except Exception as e:
        logger.error(f"Candidate profile error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@candidate_bp.route('/applications', methods=['GET'])
@token_required
def get_candidate_applications():
    try:
        resumes = Resume.query.filter_by(candidate_email=request.user_email).order_by(Resume.uploaded_at.desc()).all()
        
        apps_data = []
        for resume in resumes:
            job = Job.query.get(resume.job_id)
            apps_data.append({
                'id': resume.id,
                'job_id': resume.job_id,
                'jobTitle': job.title if job else 'Unknown Job',
                'company': job.recruiter.company if job and job.recruiter else 'Unknown Company',
                'status': resume.status,
                'score': round(resume.match_score, 2),
                'uploaded_at': resume.uploaded_at.isoformat(),
                'location': job.location if job else 'Remote'
            })
        
        return jsonify(apps_data), 200
    except Exception as e:
        logger.error(f"Candidate applications error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@candidate_bp.route('/context-analysis', methods=['GET'])
@token_required
def get_candidate_context_analysis():
    try:
        resume = Resume.query.filter_by(candidate_email=request.user_email).order_by(Resume.uploaded_at.desc()).first()
        profile = CandidateProfile.query.filter_by(user_id=request.user_id).first()
        
        if not resume:
            return jsonify({'error': 'No resume found for analysis'}), 404
            
        skill_relevance = round(resume.match_score, 2)
        experience_depth = min(100, (resume.experience_years or 0) * 10)
        portfolio_depth = 85 if profile and profile.location else 60
        project_relevance = min(100, skill_relevance + 5)
        
        analysis = {
            'signals': [
                {'label': 'Skill Relevance', 'value': skill_relevance},
                {'label': 'Experience Depth', 'value': max(40, experience_depth)},
                {'label': 'Project Relevance', 'value': project_relevance},
                {'label': 'Work Style Fit', 'value': 88},
                {'label': 'Career Trajectory', 'value': 85},
                {'label': 'Culture Alignment', 'value': 82},
                {'label': 'Portfolio Depth', 'value': portfolio_depth},
                {'label': 'Soft Skills', 'value': 70}
            ],
            'technicalSignals': ['React Expert' if 'React' in str(resume.skills) else 'Developer', 'TypeScript' if 'TypeScript' in str(resume.skills) else 'JavaScript'],
            'workStyleSignals': ['Remote-First' if 'Remote' in (resume.candidate_location or '') else 'Hybrid'],
            'careerSignals': ['Growth Trajectory', 'Stable History']
        }
        
        if resume.skills:
            if len(resume.skills) > 5:
                analysis['technicalSignals'].append('Full-stack Aware')
            if any(s in ['Performance', 'Optimization'] for s in resume.skills):
                analysis['technicalSignals'].append('Performance Focused')

        return jsonify(analysis), 200
    except Exception as e:
        logger.error(f"Context analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500
