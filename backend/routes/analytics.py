from flask import Blueprint, jsonify, request
from models.database import db, Job, Resume, User
from services.analytics import analytics_service
from utils.auth import token_required
import logging
import numpy as np

analytics_bp = Blueprint('analytics', __name__)
logger = logging.getLogger(__name__)

@analytics_bp.route('/job/<int:job_id>', methods=['GET'])
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

@analytics_bp.route('/system', methods=['GET'])
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
