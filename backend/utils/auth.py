import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from typing import Dict

def create_token(user_id: int, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(seconds=current_app.config['JWT_EXPIRATION'])
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET'], algorithm=current_app.config['JWT_ALGORITHM'])

def verify_token(token: str) -> Dict:
    try:
        return jwt.decode(token, current_app.config['JWT_SECRET'], algorithms=[current_app.config['JWT_ALGORITHM']])
    except:
        return None

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
