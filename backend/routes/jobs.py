from flask import Blueprint, request, jsonify
from models.database import db, Job, User, Resume, AuditLog
from utils.auth import token_required
import logging
from datetime import datetime
import numpy as np

jobs_bp = Blueprint('jobs', __name__)
logger = logging.getLogger(__name__)

@jobs_bp.route('', methods=['POST'])
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
                'description': job.description[:100] + '...' if job.description else '',
                'required_skills': job.required_skills or [],
                'experience_years': job.experience_years or "Not specified",
                'location': job.location or "Remote",
                'salary_range': job.salary_range or "Not specified",
                'status': job.status,
                'resumes_count': 0,
                'qualified_count': 0,
                'in_progress_count': 0,
                'created_at': job.created_at.isoformat() if job.created_at else datetime.utcnow().isoformat()
            }
        }), 201
    
    except Exception as e:
        logger.error(f"Job creation error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('', methods=['GET'])
@token_required
def list_jobs():
    try:
        user = User.query.get(request.user_id)
        
        if user.role == 'candidate':
            jobs = Job.query.filter_by(status='open').all()
        else:
            jobs = Job.query.filter_by(recruiter_id=request.user_id).all()
        
        jobs_data = []
        for job in jobs:
            try:
                resume_count = Resume.query.filter_by(job_id=job.id).count()
                qualified_count = Resume.query.filter_by(job_id=job.id).filter(Resume.match_score >= 85).count()
                in_progress_count = Resume.query.filter_by(job_id=job.id).filter(Resume.status.in_(['reviewed', 'pending', 'new'])).count()
                
                recruiter = User.query.get(job.recruiter_id)
                
                desc = job.description if job.description else "No description provided."
                if len(desc) > 100:
                    desc = desc[:100] + '...'

                jobs_data.append({
                    'id': job.id,
                    'title': job.title or "Untitled Position",
                    'description': desc,
                    'required_skills': job.required_skills or [],
                    'experience_years': job.experience_years or "Not specified",
                    'location': job.location or "Remote",
                    'status': job.status,
                    'resumes_count': resume_count,
                    'qualified_count': qualified_count,
                    'in_progress_count': in_progress_count,
                    'created_at': job.created_at.isoformat() if job.created_at else datetime.utcnow().isoformat(),
                    'salary_range': job.salary_range or "Not specified",
                    'recruiter': {
                        'name': recruiter.name if recruiter else 'Unknown recruiter',
                        'company': recruiter.company if recruiter else 'Generic Tech Corp'
                    }
                })
            except Exception as item_err:
                logger.error(f"Error processing job {job.id}: {str(item_err)}")
                continue
        
        return jsonify(jobs_data), 200
    
    except Exception as e:
        logger.error(f"List jobs error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/<int:job_id>', methods=['GET'])
@token_required
def get_job(job_id):
    try:
        job = Job.query.get(job_id)
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        resumes = Resume.query.filter_by(job_id=job_id).all()
        recruiter = User.query.get(job.recruiter_id)
        
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
            'avg_score': round(np.mean([r.match_score for r in resumes if r.match_score > 0]), 2) if resumes and any(r.match_score > 0 for r in resumes) else 0,
            'created_at': job.created_at.isoformat(),
            'recruiter': {
                'name': recruiter.name if recruiter else 'Unknown',
                'company': recruiter.company if recruiter else 'Generic Tech Corp'
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Get job error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/<int:job_id>', methods=['PUT'])
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
        if 'experience_years' in data:
            job.experience_years = data['experience_years']
        if 'location' in data:
            job.location = data['location']
        if 'salary_range' in data:
            job.salary_range = data['salary_range']
        
        job.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Job updated successfully'}), 200
    
    except Exception as e:
        logger.error(f"Update job error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@jobs_bp.route('/<int:job_id>', methods=['DELETE'])
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
