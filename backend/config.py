import os
from datetime import timedelta

class Config:
    """Base configuration"""
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'postgresql://postgres:postgres@localhost:5432/smart_hire_ai'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET = os.getenv('JWT_SECRET', 'jwt-secret-key')
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRATION = timedelta(days=7)
    
    # BERT Model
    BERT_MODEL_NAME = os.getenv(
        'BERT_MODEL_NAME',
        'sentence-transformers/all-MiniLM-L6-v2'
    )
    MODEL_CACHE_DIR = './models_cache'
    
    # Fairness Thresholds
    GENDER_BIAS_THRESHOLD = float(os.getenv('GENDER_BIAS_THRESHOLD', 0.3))
    AGE_BIAS_THRESHOLD = float(os.getenv('AGE_BIAS_THRESHOLD', 0.3))
    EDUCATION_BIAS_THRESHOLD = float(os.getenv('EDUCATION_BIAS_THRESHOLD', 0.3))
    
    # Server
    PORT = int(os.getenv('PORT', 5000))
    HOST = os.getenv('HOST', '0.0.0.0')
    DEBUG = os.getenv('DEBUG', True)

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}