from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from models.database import db, User, AuditLog
from utils.auth import create_token, token_required
import logging
from datetime import datetime

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/register', methods=['POST'])
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

@auth_bp.route('/login', methods=['POST'])
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

@auth_bp.route('/profile', methods=['GET'])
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
