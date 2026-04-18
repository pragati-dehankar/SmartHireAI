import os
from dotenv import load_dotenv

# Load environment variables before other imports
load_dotenv()
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from models.database import db
from config import config

# Import Routes/Blueprints
from routes.auth import auth_bp
from routes.jobs import jobs_bp
from routes.resumes import resumes_bp
from routes.candidate import candidate_bp
from routes.analytics import analytics_bp
from routes.fairness import fairness_bp

def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Load Configuration
    app.config.from_object(config[config_name])
    
    # Initialize Extensions
    CORS(app)
    db.init_app(app)
    
    # Setup Logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(resumes_bp, url_prefix='/api/resumes')
    app.register_blueprint(candidate_bp, url_prefix='/api/candidate')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(fairness_bp, url_prefix='/api/fairness')
    
    # Root & Health Routes
    @app.route('/', methods=['GET'])
    def home():
        return jsonify({
            "message": "🚀 SmartHire AI Backend Running (Modular)",
            "status": "success",
            "available_endpoints": [
                "/api/auth/login",
                "/api/jobs",
                "/api/resumes/upload",
                "/api/analytics/system"
            ]
        }), 200

    @app.route('/api/health', methods=['GET'])
    def health_check():
        from datetime import datetime
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

    # Ensure upload folder exists
    with app.app_context():
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        # Auto-create tables for development
        db.create_all()

    return app

app = create_app(os.getenv('FLASK_ENV', 'default'))

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config['DEBUG'])