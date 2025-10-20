# Express.js-style configuration
import os
from datetime import timedelta

class Config:
    """Base configuration class"""
    # Flask core settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')
    DEBUG = False
    TESTING = False
    
    # Database settings
    DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///plantatree.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Upload settings
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    
    # API Rate limiting
    RATELIMIT_STORAGE_URL = os.environ.get('REDIS_URL', 'memory://')
    RATELIMIT_DEFAULT = "1000 per hour"
    
    # External API keys
    AMBEE_API_KEY = os.environ.get('AMBEE_API_KEY', 'bdeedc716f3882fa7005eaf1c617bdeb943df52c1b3f3cc43b6334daf19689cc')
    GEOAPIFY_API_KEY = os.environ.get('GEOAPIFY_API_KEY', 'd67057512d7a41409604421a2e3e3411')
    GENAI_API_KEY = os.environ.get('GENAI_API_KEY')
    
    # Session settings
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    
    # CORS settings
    CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5000", "https://yourdomain.com"]
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    
    # Cache settings
    CACHE_TYPE = os.environ.get('CACHE_TYPE', 'simple')
    CACHE_DEFAULT_TIMEOUT = 300  # 5 minutes
    
    # Email settings (for future notifications)
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    ENV = 'development'
    
    # More verbose logging in development
    LOG_LEVEL = 'DEBUG'
    
    # Allow all CORS origins in development
    CORS_ORIGINS = ["*"]
    
    # Relaxed rate limiting for development
    RATELIMIT_DEFAULT = "10000 per hour"

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    ENV = 'production'
    
    # Stricter settings for production
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Tighter rate limiting
    RATELIMIT_DEFAULT = "100 per hour"
    
    # Use environment variables for sensitive data
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("No SECRET_KEY set for production environment")

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    
    # Use in-memory database for tests
    DATABASE_URL = 'sqlite:///:memory:'
    
    # Disable rate limiting for tests
    RATELIMIT_ENABLED = False
    
    # Disable CSRF for API tests
    WTF_CSRF_ENABLED = False

# Configuration selector (like Express.js NODE_ENV)
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get configuration based on environment"""
    env = os.environ.get('FLASK_ENV', 'default')
    return config.get(env, config['default'])

# API Response templates (like Express.js response helpers)
class ResponseTemplates:
    @staticmethod
    def success(data=None, message="Success", status_code=200):
        """Standard success response"""
        return {
            'success': True,
            'message': message,
            'data': data,
            'timestamp': Config.get_current_timestamp()
        }, status_code
    
    @staticmethod
    def error(message="An error occurred", error_code=None, status_code=400):
        """Standard error response"""
        return {
            'success': False,
            'error': {
                'message': message,
                'code': error_code
            },
            'timestamp': Config.get_current_timestamp()
        }, status_code
    
    @staticmethod
    def paginated_response(data, page, per_page, total):
        """Paginated response template"""
        from math import ceil
        return {
            'success': True,
            'data': data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': ceil(total / per_page),
                'has_prev': page > 1,
                'has_next': page < ceil(total / per_page)
            },
            'timestamp': Config.get_current_timestamp()
        }

# Add utility methods to Config
@classmethod
def get_current_timestamp(cls):
    from datetime import datetime
    return datetime.now().isoformat()

Config.get_current_timestamp = get_current_timestamp