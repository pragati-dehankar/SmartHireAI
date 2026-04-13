from flask import Blueprint, jsonify, request
from models.database import db, Job, Resume, FairnessLog
from services.fairness_service import fairness_service
from utils.auth import token_required
import logging

fairness_bp = Blueprint('fairness', __name__)
logger = logging.getLogger(__name__)

@fairness_bp.route('/job/<int:job_id>', methods=['GET'])
@token_required
def get_job_fairness(job_id):
    try:
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        # Get latest fairness log if available
        fairness_log = FairnessLog.query.filter_by(job_id=job_id).order_by(FairnessLog.created_at.desc()).first()
        
        if fairness_log:
            return jsonify(fairness_log.recommendations or {}), 200
        
        # If no log, run analysis on the fly
        resumes = Resume.query.filter_by(job_id=job_id).all()
        if not resumes:
            return jsonify({'message': 'No resumes to analyze'}), 200
            
        fairness_data = []
        for r in resumes:
            if r.match_score is not None:
                fairness_data.append({
                    'match_score': r.match_score,
                    'candidate_gender': r.candidate_gender,
                    'candidate_age_group': r.candidate_age_group,
                    'candidate_education_level': r.candidate_education_level,
                    'candidate_location': r.candidate_location,
                    'skills': r.skills or []
                })
        
        report = fairness_service.analyze_fairness(fairness_data)
        return jsonify(report), 200
    
    except Exception as e:
        logger.error(f"Fairness endpoint error: {str(e)}")
        return jsonify({'error': str(e)}), 500
