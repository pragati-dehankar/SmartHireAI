import os
import json
import logging
from datetime import datetime
from flask import Blueprint, request, jsonify, send_file, current_app
from werkzeug.utils import secure_filename
from models.database import db, Resume, Job, User, AuditLog, FairnessLog, CandidateProfile
from utils.auth import token_required
from utils.file_utils import allowed_file, extract_text, anonymize_text
from services.bert_service import get_bert_service
from services.explainability import explainability_service
from services.fairness_service import fairness_service

resumes_bp = Blueprint('resumes', __name__)
logger = logging.getLogger(__name__)

@resumes_bp.route('/upload', methods=['POST'])
@token_required
def upload_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
        
        file = request.files['resume']
        job_id = request.form.get('jobID')
        
        user = User.query.get(request.user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        if not job_id:
            return jsonify({'error': 'Missing jobID'}), 400
            
        # Logical Error Correction: Check for duplicate applications
        existing_application = Resume.query.filter_by(uploader_id=request.user_id, job_id=int(job_id)).first()
        if existing_application and user.role == 'candidate':
            return jsonify({'error': 'You have already applied for this position.'}), 400

        # Fix Attribution Bug: Use provided info if recruiter is uploading for someone else
        if user.role == 'recruiter':
            candidate_name = request.form.get('candidateName')
            candidate_email = request.form.get('candidateEmail')
            
            if not candidate_name or not candidate_email:
                return jsonify({'error': 'Recruiters must provide candidate name and email to upload on their behalf.'}), 400
                
            if candidate_email == user.email:
                return jsonify({'error': 'Recruiters cannot apply for jobs using their own recruiter account.'}), 400
        else:
            candidate_name = user.name
            candidate_email = user.email
        
        if not allowed_file(file.filename):
            logger.error(f"Upload failed: File type {file.filename} not allowed")
            return jsonify({'error': 'File type not allowed. Please use PDF, DOCX or TXT'}), 400
        
        filename = secure_filename(file.filename)
        timestamp = int(datetime.utcnow().timestamp())
        filename = f"{timestamp}_{filename}"
        
        # Get Candidate Metadata for Fairness Analysis
        profile = CandidateProfile.query.filter_by(user_id=request.user_id).first()
        metadata = {}
        if profile:
            metadata = {
                'candidate_gender': getattr(profile, 'gender', None), # Assuming gender might be added or infer from elsewhere
                'candidate_location': profile.location,
                'candidate_education_level': getattr(profile, 'education_level', None)
            }
        
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > current_app.config.get('MAX_FILE_SIZE', 5 * 1024 * 1024):
            return jsonify({'error': 'File too large. Maximum size is 5MB'}), 400

        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)
        
        resume = Resume(
            file_name=file.filename,
            file_path=filepath,
            candidate_name=candidate_name,
            candidate_email=candidate_email,
            job_id=int(job_id),
            uploader_id=request.user_id,
            candidate_location=metadata.get('candidate_location'),
            candidate_gender=metadata.get('candidate_gender'),
            candidate_education_level=metadata.get('candidate_education_level')
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

@resumes_bp.route('/<int:resume_id>/score', methods=['POST'])
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
            resume_text = anonymize_text(resume_text)
            
            if not resume_text or len(resume_text.strip()) == 0:
                return jsonify({'error': 'Resume file is empty or could not be parsed'}), 400
        except Exception as e:
            logger.error(f"Text extraction failed: {str(e)}")
            return jsonify({'error': f'Parsing failed: {str(e)}'}), 400
        
        try:
            bert = get_bert_service()
            scores = bert.score_resume(resume_text, job.description)
        except Exception as be:
            logger.error(f"BERT evaluation failed: {str(be)}")
            return jsonify({'error': f'BERT core error: {str(be)}'}), 500
        
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
        
        resume.match_score = scores.get('matchScore', 0)
        resume.skills = scores.get('extractedSkills', [])
        resume.scored_at = datetime.utcnow()
        resume.ai_analysis = {
            'scores': scores,
            'explanation': explanation
        }
        
        if resume.match_score >= 85:
            resume.status = 'shortlisted'
        else:
            resume.status = 'reviewed'
        
        db.session.commit()
        
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

@resumes_bp.route('/job/<int:job_id>', methods=['GET'])
@token_required
def get_resumes_by_job(job_id):
    try:
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        # Authorization: Only the recruiter who posted the job can see all resumes
        if job.recruiter_id != request.user_id:
            return jsonify({'error': 'Unauthorized access to job resumes'}), 403
        
        results = db.session.query(Resume, User).filter(Resume.job_id == job_id).join(User, Resume.uploader_id == User.id).order_by(Resume.match_score.desc()).all()
        
        resumes_data = []
        for i, (resume, uploader) in enumerate(results, 1):
            display_name = uploader.name if uploader.role == 'candidate' else resume.candidate_name
            
            resumes_data.append({
                'id': resume.id,
                'rank': i,
                'name': display_name,
                'email': uploader.email if uploader.role == 'candidate' else resume.candidate_email,
                'score': round(resume.match_score or 0, 2),
                'skills': resume.skills or [],
                'status': resume.status,
                'ai_analysis': resume.ai_analysis,
                'uploaded_at': resume.uploaded_at.isoformat()
            })
        
        return jsonify(resumes_data), 200
    
    except Exception as e:
        logger.error(f"Get resumes error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@resumes_bp.route('/<int:resume_id>', methods=['GET'])
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
            'score': round(resume.match_score or 0, 2),
            'skills': resume.skills or [],
            'experience_years': resume.experience_years,
            'education': resume.education,
            'status': resume.status,
            'ai_analysis': resume.ai_analysis,
            'uploaded_at': resume.uploaded_at.isoformat(),
            'scored_at': resume.scored_at.isoformat() if resume.scored_at else None
        }), 200
    
    except Exception as e:
        logger.error(f"Get resume error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@resumes_bp.route('/download/<int:resume_id>', methods=['GET'])
@token_required
def download_resume(resume_id):
    try:
        resume = Resume.query.get(resume_id)
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        # Authorization check
        is_uploader = resume.uploader_id == request.user_id
        is_job_recruiter = False
        
        job = Job.query.get(resume.job_id)
        if job and job.recruiter_id == request.user_id:
            is_job_recruiter = True
            
        if not (is_uploader or is_job_recruiter):
            return jsonify({'error': 'Unauthorized: Access denied to this file'}), 403
            
        abs_path = os.path.abspath(resume.file_path)
        if not os.path.exists(abs_path):
            logger.error(f"File not found: {abs_path}")
            return jsonify({'error': 'File not found on server'}), 404
            
        return send_file(abs_path, as_attachment=False, download_name=resume.file_name)
    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@resumes_bp.route('/<int:resume_id>/status', methods=['PUT'])
@token_required
def update_resume_status(resume_id):
    try:
        user = User.query.get(request.user_id)
        if not user or user.role != 'recruiter':
            return jsonify({'error': 'Unauthorized. Only recruiters can update status.'}), 403
            
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

@resumes_bp.route('/<int:resume_id>', methods=['DELETE'])
@token_required
def delete_resume(resume_id):
    try:
        resume = Resume.query.get(resume_id)
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
            
        # Only uploader or the job's recruiter can delete
        is_owner = resume.uploader_id == request.user_id
        is_job_recruiter = False
        
        job = Job.query.get(resume.job_id)
        if job and job.recruiter_id == request.user_id:
            is_job_recruiter = True
            
        if not (is_owner or is_job_recruiter):
            return jsonify({'error': 'Unauthorized deletion'}), 403
        
        if os.path.exists(resume.file_path):
            os.remove(resume.file_path)
        
        db.session.delete(resume)
        db.session.commit()
        return jsonify({'message': 'Resume deleted successfully'}), 200
    except Exception as e:
        logger.error(f"Delete resume error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
