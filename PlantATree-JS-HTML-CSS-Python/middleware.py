# Express.js-inspired middleware for Flask
from functools import wraps
from flask import request, jsonify, g
from datetime import datetime
import time
import logging

# Request logging middleware (like Morgan for Express.js)
def request_logger():
    """Log all incoming requests with timing information"""
    start_time = time.time()
    
    def log_request(response):
        duration = round((time.time() - start_time) * 1000, 2)  # milliseconds
        
        # Color codes for status
        if response.status_code < 300:
            status_color = '\033[32m'  # Green
        elif response.status_code < 400:
            status_color = '\033[33m'  # Yellow
        else:
            status_color = '\033[31m'  # Red
        
        reset_color = '\033[0m'
        
        log_entry = (
            f"{request.method} {request.path} "
            f"{status_color}{response.status_code}{reset_color} "
            f"{duration}ms - {request.remote_addr}"
        )
        
        print(log_entry)
        return response
    
    return log_request

# Rate limiting middleware
def rate_limit(max_requests=100, window_seconds=3600):
    """Rate limiting decorator (like express-rate-limit)"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            client_ip = request.remote_addr
            # Simple in-memory rate limiting (use Redis in production)
            if not hasattr(g, 'rate_limits'):
                g.rate_limits = {}
            
            current_time = datetime.now().timestamp()
            if client_ip not in g.rate_limits:
                g.rate_limits[client_ip] = {'count': 1, 'reset_time': current_time + window_seconds}
            else:
                rate_data = g.rate_limits[client_ip]
                if current_time > rate_data['reset_time']:
                    rate_data['count'] = 1
                    rate_data['reset_time'] = current_time + window_seconds
                else:
                    rate_data['count'] += 1
                    if rate_data['count'] > max_requests:
                        return jsonify({
                            'error': 'Too many requests',
                            'retry_after': int(rate_data['reset_time'] - current_time)
                        }), 429
            
            return f(*args, **kwargs)
        return wrapper
    return decorator

# Authentication middleware
def require_auth(f):
    """Simple authentication decorator"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Authorization header required'}), 401
        
        # Simple token validation (implement proper JWT in production)
        if not token.startswith('Bearer '):
            return jsonify({'error': 'Invalid token format'}), 401
            
        # Store user info in g for use in route
        g.user_id = 1  # Demo user
        return f(*args, **kwargs)
    return wrapper

# Input validation middleware
def validate_json(*required_fields):
    """Validate required JSON fields"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if not request.is_json:
                return jsonify({'error': 'Content-Type must be application/json'}), 400
            
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Invalid JSON'}), 400
            
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({
                    'error': 'Missing required fields',
                    'missing': missing_fields
                }), 400
            
            return f(*args, **kwargs)
        return wrapper
    return decorator

# Error handler decorator
def handle_errors(f):
    """Global error handling decorator"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            return jsonify({'error': f'Invalid input: {str(e)}'}), 400
        except FileNotFoundError as e:
            return jsonify({'error': f'Resource not found: {str(e)}'}), 404
        except Exception as e:
            logging.error(f"Unexpected error in {f.__name__}: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    return wrapper

# CORS headers middleware
def add_cors_headers(response):
    """Add CORS headers to response"""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

# Response compression middleware (like compression for Express.js)
def compress_response(response):
    """Add compression headers for large responses"""
    if len(response.get_data()) > 1000:  # Only compress responses > 1KB
        response.headers['Content-Encoding'] = 'gzip'
    return response

# Security headers middleware (like helmet for Express.js)
def add_security_headers(response):
    """Add security headers to all responses"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

# Health check middleware
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'uptime': time.time() - start_time if 'start_time' in globals() else 0
    })

# Set start time for uptime calculation
start_time = time.time()