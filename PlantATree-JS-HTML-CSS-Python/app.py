from flask import Flask, render_template, request, jsonify, send_from_directory, g
from flask_cors import CORS
import json
import os
from datetime import datetime, timedelta
import sqlite3
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import requests
import google.generativeai as genai
import jwt
import time

try:
    from deep_translator import GoogleTranslator
    GOOGLE_TRANSLATE_AVAILABLE = True
    print("✓ Deep Translator library loaded successfully")
except ImportError as e:
    print(f"Translation library not available: {e}")
    GOOGLE_TRANSLATE_AVAILABLE = False
    GoogleTranslator = None

from dotenv import load_dotenv
load_dotenv()  

def validate_environment():
    """Validate required environment variables"""
    required_vars = {
        'SECRET_KEY': 'Flask secret key for sessions',
        'AMBEE_API_KEY': 'Air quality API key',
    }
    
    missing_vars = []
    for var, description in required_vars.items():
        if not os.getenv(var):
            missing_vars.append(f"  • {var}: {description}")
    
    if missing_vars:
        print("Missing required environment variables:")
        print("\n".join(missing_vars))
        print("Please update your .env file with the required values.")
        return False
    return True

if not validate_environment():
    print("Server cannot start due to missing configuration.")
    exit(1)

try:
    from middleware import (
        request_logger, rate_limit, require_auth, validate_json, 
        handle_errors, add_cors_headers, add_security_headers
    )
    MIDDLEWARE_AVAILABLE = True
except ImportError as e:
    print(f"Middleware not available: {e}")
    MIDDLEWARE_AVAILABLE = False

try:
    from routes_v1 import api_v1, admin_routes
    ROUTES_V1_AVAILABLE = True
except ImportError as e:
    print(f"Routes V1 not available: {e}")
    ROUTES_V1_AVAILABLE = False

app = Flask(__name__)
CORS(app)  

@app.before_request
def before_request():
    g.start_time = time.time()

@app.after_request
def after_request(response):
    
    if MIDDLEWARE_AVAILABLE:
        response = add_cors_headers(response)
        response = add_security_headers(response)
    else:
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
    
    if hasattr(g, 'start_time'):
        duration = round((time.time() - g.start_time) * 1000, 2)
        print(f"{request.method} {request.path} - {response.status_code} - {duration}ms")
    
    return response

if ROUTES_V1_AVAILABLE:
    app.register_blueprint(api_v1)
    app.register_blueprint(admin_routes)
    print("V1 API Routes registered")
else:
    print("V1 API Routes not available - using legacy routes")

AMBEE_API_KEY = os.getenv('AMBEE_API_KEY')
AMBEE_BASE_URL = os.getenv('AMBEE_BASE_URL', 'https://api.ambeedata.com')

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback-secret-key')
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', '16777216'))  

CLOUD_DB_URL = os.environ.get('DATABASE_URL')  
USE_CLOUD_DB = CLOUD_DB_URL is not None

if USE_CLOUD_DB:
    print(" Using cloud database:", CLOUD_DB_URL[:50] + "...")
else:
    print(" Using local SQLite database")

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def get_db_connection():
    """Get database connection - local SQLite or cloud PostgreSQL"""
    if USE_CLOUD_DB:
        try:
            import psycopg2
            return psycopg2.connect(CLOUD_DB_URL)
        except ImportError:
            print("psycopg2 not installed, falling back to SQLite")
            return sqlite3.connect('infousers.db')
        except Exception as e:
            print(f"Cloud DB connection failed: {e}, falling back to SQLite")
            return sqlite3.connect('infousers.db')
    else:
        return sqlite3.connect('infousers.db')

def init_db():
    """Initialize database with required tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'regular' CHECK(role IN ('regular', 'admin')),
            profile_picture TEXT DEFAULT NULL,
            points INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP DEFAULT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            user_id INTEGER,
            approved BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS eco_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL,
            location_name TEXT,
            image_path TEXT,
            points INTEGER DEFAULT 0,
            user_id INTEGER,
            approved BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            requirement_type TEXT,
            requirement_value INTEGER
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_badges (
            user_id INTEGER,
            badge_id INTEGER,
            earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, badge_id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (badge_id) REFERENCES badges (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sofia_redesigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            geometry TEXT NOT NULL,
            coordinates TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('SELECT COUNT(*) FROM users WHERE role = "admin"')
    if cursor.fetchone()[0] == 0:
        admin_password_hash = generate_password_hash('admin123')  
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, role, points)
            VALUES (?, ?, ?, ?, ?)
        ''', ('admin', 'admin@plantatree.com', admin_password_hash, 'admin', 1000))
        print("✓ Default admin user created (admin@plantatree.com / admin123)")
    
    cursor.execute('SELECT COUNT(*) FROM locations')
    if cursor.fetchone()[0] == 0:
        sample_locations = [
            ('Борисова градина', 'Най-големият парк в София с много дървета и алеи', 'park', 42.6755, 23.3348, None, True),
            ('Витоша парк', 'Красив парк в подножието на планината', 'park', 42.6447, 23.2750, None, True),
            ('Еко пътека Витоша', 'Планинска еко пътека с прекрасни гледки', 'trail', 42.5569, 23.2892, None, True),
            ('Велоалея Дунав', 'Велосипедна алея покрай река Дунав', 'bike', 42.6892, 23.3517, None, True),
            ('Зона за засаждане', 'Специално място за засаждане на нови дървета', 'plant', 42.6977, 23.3219, None, True)
        ]
        
        cursor.executemany('''
            INSERT INTO locations (name, description, type, latitude, longitude, user_id, approved)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', sample_locations)
    
    cursor.execute('SELECT COUNT(*) FROM badges')
    if cursor.fetchone()[0] == 0:
        sample_badges = [
            ('Tree Planter', 'Засади първото си дърво', 'Tree', 'trees', 1),
            ('Eco Hero', 'Направи 10 еко действия', 'Eco', 'actions', 10),
            ('Green Warrior', 'Събери 100 точки', 'Trophy', 'points', 100),
            ('Nature Lover', 'Посети 5 различни зелени зони', 'Nature', 'locations', 5),
            ('Bike Rider', 'Използвай велосипед 10 пъти', 'Bike', 'bike_rides', 10)
        ]
        
        cursor.executemany('''
            INSERT INTO badges (name, description, icon, requirement_type, requirement_value)
            VALUES (?, ?, ?, ?, ?)
        ''', sample_badges)
    
    conn.commit()
    conn.close()

init_db()

import os
from dotenv import load_dotenv
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    print("Google Generative AI not available - chat functionality disabled")
    GENAI_AVAILABLE = False
    genai = None

GENAI_API_KEY = os.getenv('GENAI_API_KEY')
GEMINI_MODEL = None

if GENAI_AVAILABLE and GENAI_API_KEY:
    try:
        genai.configure(api_key=GENAI_API_KEY)
        GEMINI_MODEL = genai.GenerativeModel(
            model_name='gemini-2.5-flash',
            system_instruction=(
                "Ти си Еко Асистент за платформата EcoBuilders, фокусирана върху еко инициативи в София, България. "
                "Отговаряй на български език и английски, в зависимост от контекста, кратко, ясно и полезно, в обикновен текст без Markdown форматиране. "
                "Не използвай удебелен текст, списъци, нови редове със знаци (напр. \n, *, -) или други специални символи за форматиране. "
                "Предоставяй информация за засаждане на дървета, почистване, велоалеи, зелени зони и други еко действия. "
                "Бъди дружелюбен и насърчавай потребителите да се включат в еко инициативи."
            )
        )
        print("Gemini 2.5 готов с главен промпт!")
    except Exception as e:
        print(f"Gemini грешка: {e}")
        GEMINI_MODEL = None
elif not GENAI_AVAILABLE:
    print("Google Generative AI не е инсталиран")
else:
    print("ℹ GENAI_API_KEY not set - AI chat functionality will be disabled")
# Routes
# Express.js-style API info endpoint
@app.route('/api', methods=['GET'])
def api_info():
    """API information endpoint (like Express.js API documentation)"""
    return jsonify({
        'name': 'PlantATree API',
        'version': '1.0.0',
        'description': 'Еко платформа за София API',
        'endpoints': {
            'v1': '/api/v1/',
            'admin': '/api/admin/',
            'health': '/api/health',
            'docs': '/api/docs'
        },
        'features': [
            'Locations management',
            'Eco actions tracking',
            'Real-time statistics',
            'Air quality data',
            'Weather information',
            'AI chat assistant'
        ],
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Comprehensive health check endpoint"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT 1')
        db_status = 'healthy'
        conn.close()
    except Exception as e:
        db_status = f'unhealthy: {str(e)}'
    
    external_apis = {}
    try:
        response = requests.get('https://httpbin.org/status/200', timeout=5)
        external_apis['connectivity'] = 'healthy' if response.status_code == 200 else 'unhealthy'
    except Exception:
        external_apis['connectivity'] = 'unhealthy'
    
    overall_status = 'healthy' if db_status == 'healthy' and external_apis['connectivity'] == 'healthy' else 'degraded'
    
    return jsonify({
        'status': overall_status,
        'timestamp': datetime.now().isoformat(),
        'services': {
            'database': db_status,
            'external_apis': external_apis,
            'server': 'healthy'
        },
        'uptime_seconds': time.time() - app.config.get('START_TIME', time.time()),
        'version': '1.0.0'
    })

def get_current_user():
    """Get current user from JWT token in Authorization header"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.replace('Bearer ', '')
        if not token:
            return None
        
        try:
            # Use configured SECRET_KEY to decode tokens consistently
            payload = jwt.decode(token, app.config.get('SECRET_KEY'), algorithms=['HS256'])
            user_id = payload.get('user_id')
            
            if not user_id:
                return None
            
            # Get user from database
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, username, email, role, created_at 
                FROM users 
                WHERE id = ?
            ''', (user_id,))
            
            user_row = cursor.fetchone()
            conn.close()
            
            if not user_row:
                return None
            
            return {
                'id': user_row[0],
                'username': user_row[1],
                'email': user_row[2],
                'role': user_row[3],
                'created_at': user_row[4]
            }
            
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
            
    except Exception as e:
        print(f"Error in get_current_user: {e}")
        return None

@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('.', 'index.html')

@app.route('/robots.txt')
def robots():
    """Serve robots.txt for SEO"""
    return send_from_directory('.', 'robots.txt', mimetype='text/plain')

@app.route('/sitemap.xml')
def sitemap():
    """Serve sitemap.xml for SEO"""
    return send_from_directory('.', 'sitemap.xml', mimetype='application/xml')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files (CSS, JS, images)"""
    return send_from_directory('.', filename)

@app.route('/api/locations', methods=['GET'])
def get_locations():
    """Get all approved locations"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, name, description, type, latitude, longitude, created_at
        FROM locations 
        WHERE approved = TRUE
        ORDER BY created_at DESC
    ''')
    
    locations = []
    for row in cursor.fetchall():
        locations.append({
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'type': row[3],
            'latitude': row[4],
            'longitude': row[5],
            'created_at': row[6]
        })
    
    conn.close()
    return jsonify(locations)

@app.route('/api/locations', methods=['POST'])
def add_location():
    """Add a new location"""
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO locations (name, description, type, latitude, longitude, user_id, approved)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['name'],
            data['description'],
            data['type'],
            data.get('latitude'),
            data.get('longitude'),
            data.get('user_id', 1),  
            False  
        ))
        
        location_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': 'Локацията е добавена за одобрение!',
            'location_id': location_id
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/eco-actions', methods=['GET'])
def get_eco_actions():
    """Get all approved eco actions"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT ea.id, ea.title, ea.description, ea.type, ea.location_name, 
               ea.image_path, ea.points, ea.created_at, u.username, u.profile_picture
        FROM eco_actions ea
        LEFT JOIN users u ON ea.user_id = u.id
        WHERE ea.approved = TRUE
        ORDER BY ea.created_at DESC
        LIMIT 20
    ''')
    
    actions = []
    for row in cursor.fetchall():
        actions.append({
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'type': row[3],
            'location_name': row[4],
            'image_path': row[5],
            'points': row[6],
            'created_at': row[7],
            'username': row[8] or 'Анонимен потребител',
            'user_profile_picture': row[9] if len(row) > 9 else None
        })
    
    conn.close()
    return jsonify(actions)

@app.route('/api/eco-actions', methods=['POST'])
def add_eco_action():
    """Add a new eco action"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'Трябва да влезете в профила си'}), 401
        
        image_path = None
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename:
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
                filename = timestamp + filename
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                image_path = f'uploads/{filename}'
        
        title = request.form.get('title')
        description = request.form.get('description')
        action_type = request.form.get('type')
        location_name = request.form.get('location')
        
        if not all([title, description, action_type]):
            return jsonify({'success': False, 'error': 'Моля попълнете всички задължителни полета'}), 400
        
        points_map = {
            'tree': 15,
            'clean': 10,
            'bike': 5,
            'recycle': 8
        }
        points = points_map.get(action_type, 5)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO eco_actions (title, description, type, location_name, image_path, points, user_id, approved)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            title, description, action_type, location_name, 
            image_path, points, current_user['id'], True 
        ))
        
        action_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Еко действието е добавено! Получихте {points} точки!',
            'action_id': action_id,
            'points': points,
            'image_path': image_path
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/charity-stats', methods=['GET'])
def get_charity_stats():
    """Get charity statistics - total points from all eco actions"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT SUM(points) FROM eco_actions WHERE approved = TRUE')
        total_points = cursor.fetchone()[0] or 0
        
        donations_made = total_points // 500
        total_donated = donations_made * 1.0 
        
        conn.close()
        
        return jsonify({
            'total_points': total_points,
            'donations_made': donations_made,
            'total_donated_bgn': total_donated,
            'current_cycle_points': total_points % 500,
            'points_to_next_donation': 500 - (total_points % 500)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get leaderboard data with user rankings"""
    try:
        period = request.args.get('period', 'all')  
        action_type = request.args.get('type', 'all')  
        limit = int(request.args.get('limit', 50))
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        base_query = """
            SELECT 
                u.id,
                u.username,
                COALESCE(SUM(ea.points), 0) as total_points,
                COUNT(ea.id) as total_actions,
                u.created_at,
                GROUP_CONCAT(DISTINCT b.icon || ' ' || b.name) as badges
            FROM users u
            LEFT JOIN eco_actions ea ON u.id = ea.user_id AND ea.approved = TRUE
            LEFT JOIN user_badges ub ON u.id = ub.user_id
            LEFT JOIN badges b ON ub.badge_id = b.id
        """
        
        where_conditions = []
        params = []
        
        if action_type != 'all':
            where_conditions.append("ea.type = ?")
            params.append(action_type)
            
        if period == 'week':
            where_conditions.append("ea.created_at >= date('now', '-7 days')")
        elif period == 'month':
            where_conditions.append("ea.created_at >= date('now', '-1 month')")
        elif period == 'year':
            where_conditions.append("ea.created_at >= date('now', '-1 year')")
        
        if where_conditions:
            base_query += " WHERE " + " AND ".join(where_conditions)
            
        base_query += """
            GROUP BY u.id, u.username, u.created_at
            ORDER BY total_points DESC, total_actions DESC
            LIMIT ?
        """
        params.append(limit)
        
        cursor.execute(base_query, params)
        rows = cursor.fetchall()
        
        leaderboard = []
        for i, row in enumerate(rows):
            user_data = {
                'rank': i + 1,
                'id': row[0],
                'username': row[1],
                'points': row[2],
                'actions': row[3],
                'join_date': row[4],
                'badges': row[5].split(',') if row[5] else [],
                'avatar': f'https://via.placeholder.com/80?text={row[1][0].upper()}'
            }
            
            if user_data['points'] >= 1000:
                user_data['level'] = 'Еко легенда'
            elif user_data['points'] >= 750:
                user_data['level'] = 'Еко майстор'
            elif user_data['points'] >= 500:
                user_data['level'] = 'Еко експерт'
            elif user_data['points'] >= 300:
                user_data['level'] = 'Еко активист'
            elif user_data['points'] >= 150:
                user_data['level'] = 'Еко ентусиаст'
            else:
                user_data['level'] = 'Еко новак'
                
            leaderboard.append(user_data)
        
        # Get total statistics
        cursor.execute('SELECT COUNT(*) FROM users')
        total_users = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM eco_actions WHERE approved = TRUE')
        total_actions = cursor.fetchone()[0]
        
        cursor.execute('SELECT SUM(points) FROM eco_actions WHERE approved = TRUE')
        total_points = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return jsonify({
            'leaderboard': leaderboard,
            'statistics': {
                'total_users': total_users,
                'total_actions': total_actions,
                'total_points': total_points
            },
            'period': period,
            'type': action_type
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get platform statistics"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Count locations
    cursor.execute('SELECT COUNT(*) FROM locations WHERE approved = TRUE')
    locations_count = cursor.fetchone()[0]
    
    # Count eco actions (trees planted)
    cursor.execute('SELECT COUNT(*) FROM eco_actions WHERE approved = TRUE AND type = "tree"')
    trees_count = cursor.fetchone()[0]
    
    # Count active users (simplified)
    cursor.execute('SELECT COUNT(DISTINCT user_id) FROM eco_actions WHERE approved = TRUE')
    users_count = cursor.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'locations': locations_count,
        'trees': trees_count,
        'users': users_count
    })

@app.route('/api/user/<int:user_id>/profile', methods=['GET'])
def get_user_profile(user_id):
    """Get user profile with stats and badges"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get user info
    cursor.execute('SELECT username, email, points FROM users WHERE id = ?', (user_id,))
    user_data = cursor.fetchone()
    
    if not user_data:
        return jsonify({'error': 'User not found'}), 404
    
    # Get user's eco actions count
    cursor.execute('SELECT COUNT(*) FROM eco_actions WHERE user_id = ? AND approved = TRUE', (user_id,))
    actions_count = cursor.fetchone()[0]
    
    # Get user's badges
    cursor.execute('''
        SELECT b.name, b.description, b.icon, ub.earned_at
        FROM badges b
        JOIN user_badges ub ON b.id = ub.badge_id
        WHERE ub.user_id = ?
    ''', (user_id,))
    
    badges = []
    for row in cursor.fetchall():
        badges.append({
            'name': row[0],
            'description': row[1], 
            'icon': row[2],
            'earned_at': row[3]
        })
    
    conn.close()
    
    return jsonify({
        'username': user_data[0],
        'email': user_data[1],
        'points': user_data[2],
        'actions_count': actions_count,
        'badges': badges
    })

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/uploads/profiles/<filename>')
def profile_picture(filename):
    """Serve profile pictures"""
    profiles_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'profiles')
    return send_from_directory(profiles_dir, filename)

# Express.js-style comprehensive error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        'error': 'Bad Request',
        'message': 'Invalid request format or parameters',
        'status_code': 400,
        'timestamp': datetime.now().isoformat()
    }), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({
        'error': 'Unauthorized',
        'message': 'Authentication required',
        'status_code': 401,
        'timestamp': datetime.now().isoformat()
    }), 401

@app.errorhandler(403)
def forbidden(error):
    return jsonify({
        'error': 'Forbidden',
        'message': 'Access denied',
        'status_code': 403,
        'timestamp': datetime.now().isoformat()
    }), 403

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Not Found',
        'message': 'Ресурсът не е намерен',
        'status_code': 404,
        'timestamp': datetime.now().isoformat()
    }), 404

@app.errorhandler(429)
def rate_limit_exceeded(error):
    return jsonify({
        'error': 'Too Many Requests',
        'message': 'Rate limit exceeded. Please try again later.',
        'status_code': 429,
        'timestamp': datetime.now().isoformat()
    }), 429

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'Вътрешна грешка на сървъра',
        'status_code': 500,
        'timestamp': datetime.now().isoformat()
    }), 500

# Global exception handler
@app.errorhandler(Exception)
def handle_unexpected_error(error):
    # Log the error for debugging
    app.logger.error(f'Unexpected error: {str(error)}', exc_info=True)
    
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'An unexpected error occurred',
        'status_code': 500,
        'timestamp': datetime.now().isoformat()
    }), 500

# Auth routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user with profile picture support"""
    try:
        # Handle both JSON and form data
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Form data with file upload
            username = request.form.get('username')
            email = request.form.get('email')
            password = request.form.get('password')
            confirm_password = request.form.get('confirm_password')
            role = 'regular'  # Always set to regular for new registrations
            
            # Handle profile picture upload
            profile_picture_path = None
            if 'profile_picture' in request.files:
                file = request.files['profile_picture']
                if file and file.filename:
                    # Validate file type
                    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
                    file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
                    
                    if file_extension in allowed_extensions:
                        filename = secure_filename(file.filename)
                        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
                        filename = f"profile_{timestamp}{filename}"
                        
                        # Create profiles directory if it doesn't exist
                        profiles_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'profiles')
                        os.makedirs(profiles_dir, exist_ok=True)
                        
                        file_path = os.path.join(profiles_dir, filename)
                        file.save(file_path)
                        profile_picture_path = f'uploads/profiles/{filename}'
                    else:
                        return jsonify({'success': False, 'message': 'Invalid file type. Please use PNG, JPG, JPEG, GIF, or WebP.'}), 400
        else:
            # JSON data
            data = request.get_json()
            if not data:
                return jsonify({'success': False, 'message': 'No data provided'}), 400
                
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            confirm_password = data.get('confirm_password')
            role = 'regular'  # Always set to regular for new registrations
            profile_picture_path = None
        
        # Validation
        if not all([username, email, password, confirm_password]):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400
        
        if password != confirm_password:
            return jsonify({'success': False, 'message': 'Passwords do not match'}), 400
        
        if len(password) < 6:
            return jsonify({'success': False, 'message': 'Password must be at least 6 characters long'}), 400
        
        if role not in ['regular', 'admin']:
            role = 'regular'  # Force to regular since admins are created manually
        
        # Check if user already exists
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'success': False, 'message': 'Email already registered'}), 400
            
        cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'success': False, 'message': 'Username already taken'}), 400
        
        # Create new user
        hashed_password = generate_password_hash(password)
        
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, role, profile_picture, points)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (username, email, hashed_password, role, profile_picture_path, 0))
        
        user_id = cursor.lastrowid
        
        # Create session token
        session_token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.now() + timedelta(days=7)  # 7 days expiry
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        # Store session in database
        expires_at = datetime.now() + timedelta(days=7)
        cursor.execute('''
            INSERT INTO user_sessions (user_id, session_token, expires_at)
            VALUES (?, ?, ?)
        ''', (user_id, session_token, expires_at))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Registration successful!',
            'token': session_token,
            'user': {
                'id': user_id,
                'username': username,
                'email': email,
                'role': role,
                'profile_picture': profile_picture_path,
                'points': 0
            }
        }), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'success': False, 'message': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user with enhanced security"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'success': False, 'message': 'Email and password are required'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get user with role and profile picture
        cursor.execute('''
            SELECT id, username, email, password_hash, role, profile_picture, points, is_active
            FROM users WHERE email = ?
        ''', (email,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
        
        if not user[7]:  # is_active
            conn.close()
            return jsonify({'success': False, 'message': 'Account is deactivated'}), 401
        
        if not check_password_hash(user[3], password):
            conn.close()
            return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
        
        # Update last login
        cursor.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', (user[0],))
        
        # Create session token
        session_token = jwt.encode({
            'user_id': user[0],
            'role': user[4],
            'exp': datetime.now() + timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        # Store session in database
        expires_at = datetime.now() + timedelta(days=7)
        cursor.execute('''
            INSERT INTO user_sessions (user_id, session_token, expires_at)
            VALUES (?, ?, ?)
        ''', (user[0], session_token, expires_at))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Login successful!',
            'token': session_token,
            'user': {
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'role': user[4],
                'profile_picture': user[5],
                'points': user[6]
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'success': False, 'message': f'Login failed: {str(e)}'}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout user and invalidate session"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'success': False, 'message': 'No authorization header'}), 401
        
        token = auth_header.replace('Bearer ', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Remove session from database
        cursor.execute('DELETE FROM user_sessions WHERE session_token = ?', (token,))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Logged out successfully'}), 200
        
    except Exception as e:
        print(f"Logout error: {e}")
        return jsonify({'success': False, 'message': 'Logout failed'}), 500

@app.route('/api/auth/profile', methods=['GET'])
def get_profile():
    """Get current user profile"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            print("No authorization header")
            return jsonify({'success': False, 'message': 'No authorization header'}), 401
        
        token = auth_header.replace('Bearer ', '')
        print(f"Token received: {token[:20]}...")
        
        # Verify token
        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = payload['user_id']
            print(f"JWT decoded successfully, user_id: {user_id}")
        except jwt.ExpiredSignatureError:
            print("Token expired")
            return jsonify({'success': False, 'message': 'Token expired'}), 401
        except jwt.InvalidTokenError as e:
            print(f"Invalid token: {e}")
            return jsonify({'success': False, 'message': 'Invalid token'}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get user information directly using the JWT user_id
        cursor.execute('''
            SELECT id, username, email, role, profile_picture, points, created_at
            FROM users 
            WHERE id = ?
        ''', (user_id,))
        
        user = cursor.fetchone()
        if not user:
            conn.close()
            return jsonify({'success': False, 'message': 'User not found'}), 401
        
        # Get user's eco actions count
        cursor.execute('SELECT COUNT(*) FROM eco_actions WHERE user_id = ? AND approved = TRUE', (user_id,))
        actions_count = cursor.fetchone()[0]
        
        # Get user's badges
        cursor.execute('''
            SELECT b.name, b.description, b.icon, ub.earned_at
            FROM badges b
            JOIN user_badges ub ON b.id = ub.badge_id
            WHERE ub.user_id = ?
            ORDER BY ub.earned_at DESC
        ''', (user_id,))

        badges = []
        for row in cursor.fetchall():
            badges.append({
                'name': row[0],
                'description': row[1], 
                'icon': row[2],
                'earned_at': row[3]
            })
        
        # Get user's recent eco actions history
        cursor.execute('''
            SELECT title, description, type, location_name, points, created_at
            FROM eco_actions 
            WHERE user_id = ? AND approved = TRUE
            ORDER BY created_at DESC
            LIMIT 10
        ''', (user_id,))
        
        recent_actions = []
        for row in cursor.fetchall():
            recent_actions.append({
                'title': row[0],
                'description': row[1],
                'type': row[2],
                'location_name': row[3],
                'points': row[4],
                'created_at': row[5]
            })

        conn.close()

        return jsonify({
            'success': True,
            'user': {
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'role': user[3],
                'profile_picture': user[4],
                'points': user[5],
                'created_at': user[6],
                'actions_count': actions_count,
                'badges': badges,
                'recent_actions': recent_actions
            }
        }), 200
        
    except Exception as e:
        print(f"Profile error: {e}")
        return jsonify({'success': False, 'message': 'Failed to get profile'}), 500

# Admin routes (for future implementation)
@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    """Get all users (admin only)"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'success': False, 'message': 'No authorization header'}), 401
        
        token = auth_header.replace('Bearer ', '')
        
        # Verify token and check admin role
        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user_role = payload.get('role')
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': 'Invalid token'}), 401
        
        if user_role != 'admin':
            return jsonify({'success': False, 'message': 'Admin access required'}), 403
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, username, email, role, profile_picture, points, is_active, created_at, last_login
            FROM users
            ORDER BY created_at DESC
        ''')
        
        users = []
        for row in cursor.fetchall():
            users.append({
                'id': row[0],
                'username': row[1],
                'email': row[2],
                'role': row[3],
                'profile_picture': row[4],
                'points': row[5],
                'is_active': row[6],
                'created_at': row[7],
                'last_login': row[8]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'users': users,
            'total_count': len(users)
        }), 200
        
    except Exception as e:
        print(f"Admin users error: {e}")
        return jsonify({'success': False, 'message': 'Failed to get users'}), 500

@app.route('/api/admin/users/<int:user_id>/toggle-status', methods=['POST'])
def toggle_user_status(user_id):
    """Toggle user active status (admin only)"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'success': False, 'message': 'No authorization header'}), 401
        
        token = auth_header.replace('Bearer ', '')
        
        # Verify token and check admin role
        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user_role = payload.get('role')
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': 'Invalid token'}), 401
        
        if user_role != 'admin':
            return jsonify({'success': False, 'message': 'Admin access required'}), 403
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get current status
        cursor.execute('SELECT is_active FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        # Toggle status
        new_status = not user[0]
        cursor.execute('UPDATE users SET is_active = ? WHERE id = ?', (new_status, user_id))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'User {"activated" if new_status else "deactivated"} successfully',
            'new_status': new_status
        }), 200
        
    except Exception as e:
        print(f"Toggle user status error: {e}")
        return jsonify({'success': False, 'message': 'Failed to toggle user status'}), 500

@app.route('/api/admin/locations/pending', methods=['GET'])
def get_pending_locations():
    """Get locations waiting for approval"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT l.id, l.name, l.description, l.type, l.created_at, u.username
        FROM locations l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE l.approved = FALSE
        ORDER BY l.created_at DESC
    ''')
    
    pending = []
    for row in cursor.fetchall():
        pending.append({
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'type': row[3],
            'created_at': row[4],
            'username': row[5] or 'Анонимен'
        })
    
    conn.close()
    return jsonify(pending)

@app.route('/api/admin/locations/<int:location_id>/approve', methods=['POST'])
def approve_location(location_id):
    """Approve a pending location"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('UPDATE locations SET approved = TRUE WHERE id = ?', (location_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Локацията е одобрена!'})

# Sofia Redesign API Endpoints
@app.route('/api/redesigns', methods=['GET'])
def get_redesigns():
    """Get all Sofia redesigns"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM sofia_redesigns ORDER BY created_at DESC')
        redesigns = []
        for row in cursor.fetchall():
            redesigns.append({
                'id': row[0],
                'type': row[1],
                'geometry': json.loads(row[2]),
                'coordinates': json.loads(row[3]),
                'description': row[4],
                'created_at': row[5]
            })
        
        conn.close()
        return jsonify(redesigns)
    except Exception as e:
        print(f"Error getting redesigns: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/redesigns', methods=['POST'])
def add_redesign():
    """Add new Sofia redesign"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        data = request.get_json()
        
        redesign_type = data.get('type')
        geometry = json.dumps(data.get('geometry'))
        coordinates = json.dumps(data.get('coordinates'))
        description = data.get('description', '')
        
        cursor.execute(
            'INSERT INTO sofia_redesigns (type, geometry, coordinates, description) VALUES (?, ?, ?, ?)',
            (redesign_type, geometry, coordinates, description)
        )
        conn.commit()
        
        redesign_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Преустройството е запазено!',
            'id': redesign_id
        })
    except Exception as e:
        print(f"Error adding redesign: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/redesigns/<int:redesign_id>', methods=['PUT'])
def update_redesign(redesign_id):
    """Update Sofia redesign"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        data = request.get_json()
        
        geometry = json.dumps(data.get('geometry'))
        coordinates = json.dumps(data.get('coordinates'))
        description = data.get('description', '')
        
        cursor.execute(
            'UPDATE sofia_redesigns SET geometry = ?, coordinates = ?, description = ? WHERE id = ?',
            (geometry, coordinates, description, redesign_id)
        )
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Преустройството е обновено!'
        })
    except Exception as e:
        print(f"Error updating redesign: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/redesigns/<int:redesign_id>', methods=['DELETE'])
def delete_redesign(redesign_id):
    """Delete Sofia redesign"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM sofia_redesigns WHERE id = ?', (redesign_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Преустройството е изтрито!'
        })
    except Exception as e:
        print(f"Error deleting redesign: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/redesigns', methods=['DELETE'])
def clear_all_redesigns():
    """Clear all Sofia redesigns"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM sofia_redesigns')
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Всички преустройства са изчистени!'
        })
    except Exception as e:
        print(f"Error clearing redesigns: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ==================== AMBEE API ENDPOINTS ====================

@app.route('/api/air-quality', methods=['GET'])
def get_air_quality():
    """Get air quality data from Ambee API"""
    try:
        lat = request.args.get('lat', 42.6977)  # Default to Sofia
        lon = request.args.get('lon', 23.3219)
        
        print(f"Fetching air quality data for lat: {lat}, lon: {lon}")
        
        # Make request to Ambee API
        url = f"{AMBEE_BASE_URL}/latest/by-lat-lng"
        headers = {
            'x-api-key': AMBEE_API_KEY,
            'Content-type': 'application/json'
        }
        params = {
            'lat': lat,
            'lng': lon
        }
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"Air quality data received: {data}")
            return jsonify({
                'status': 'success',
                'data': data,
                'source': 'ambee_api'
            })
        else:
            print(f"Ambee API error: {response.status_code}")
            # Return fallback data for Sofia
            return jsonify({
                'status': 'success',
                'data': {
                    'message': 'success',
                    'stations': [{
                        'AQI': 44,
                        'PM25': 8.177,
                        'PM10': 20.523,
                        'NO2': 7.497,
                        'OZONE': 22.803,
                        'CO': 1.072,
                        'SO2': 0.816,
                        'city': 'Sofia',
                        'countryCode': 'BG',
                        'updatedAt': datetime.now().isoformat()
                    }]
                },
                'source': 'fallback'
            })
            
    except Exception as e:
        print(f"Error fetching air quality data: {e}")
        return jsonify({
            'status': 'success',
            'data': {
                'message': 'success',
                'stations': [{
                    'AQI': 44,
                    'PM25': 8.177,
                    'PM10': 20.523,
                    'NO2': 7.497,
                    'OZONE': 22.803,
                    'CO': 1.072,
                    'SO2': 0.816,
                    'city': 'Sofia',
                    'countryCode': 'BG',
                    'updatedAt': datetime.now().isoformat()
                }]
            },
            'source': 'fallback'
        })

@app.route('/api/weather', methods=['GET'])
def get_weather():
    """Get weather data from Ambee API"""
    try:
        lat = request.args.get('lat', 42.6977)  # Default to Sofia
        lon = request.args.get('lon', 23.3219)
        
        print(f"Fetching weather data for lat: {lat}, lon: {lon}")
        
        # Make request to Ambee API
        url = f"{AMBEE_BASE_URL}/weather/latest/by-lat-lng"
        headers = {
            'x-api-key': AMBEE_API_KEY,
            'Content-type': 'application/json'
        }
        params = {
            'lat': lat,
            'lng': lon
        }
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"Weather data received: {data}")
            
            # Convert temperature from Fahrenheit to Celsius if needed
            if 'data' in data and 'temperature' in data['data']:
                temp_f = data['data']['temperature']
                if temp_f:
                    temp_c = (temp_f - 32) * 5/9
                    data['data']['temperatureC'] = round(temp_c, 1)
                    data['data']['temperatureF'] = temp_f
                    print(f"Temperature converted: {temp_f}°F = {temp_c:.1f}°C")
            
            return jsonify({
                'status': 'success',
                'data': data,
                'source': 'ambee_api'
            })
        else:
            print(f"Ambee Weather API error: {response.status_code}")
            # Return fallback weather data for Sofia
            return jsonify({
                'status': 'success',
                'data': {
                    'data': {
                        'temperature': 41,  # Fahrenheit (5°C)
                        'temperatureC': 5,  # Celsius  
                        'temperatureF': 41, # Fahrenheit
                        'humidity': 78,
                        'windSpeed': 2.1,
                        'visibility': 6500,
                        'pressure': 1018.5
                    }
                },
                'source': 'fallback'
            })
            
    except Exception as e:
        print(f"Error fetching weather data: {e}")
        return jsonify({
            'status': 'success',
            'data': {
                'data': {
                    'temperature': 41,  # Fahrenheit (5°C)
                    'temperatureC': 5,  # Celsius
                    'temperatureF': 41, # Fahrenheit
                    'humidity': 78,
                    'windSpeed': 2.1,
                    'visibility': 6500,
                    'pressure': 1018.5
                }
            },
            'source': 'fallback'
        })

@app.route('/video/<filename>')
def serve_video(filename):
    """Serve video files with proper range support"""
    import mimetypes
    import os
    from werkzeug.exceptions import NotFound
    
    # Security check
    if '..' in filename or filename.startswith('/'):
        raise NotFound()
    
    file_path = os.path.join('.', filename)
    
    if not os.path.exists(file_path):
        raise NotFound()
    
    # Get file size for range requests
    file_size = os.path.getsize(file_path)
    
    # Create response with range support
    response = send_from_directory(
        '.', 
        filename,
        mimetype='video/mp4',
        as_attachment=False,
        conditional=True
    )
    
    # Essential headers for video streaming
    response.headers['Accept-Ranges'] = 'bytes'
    response.headers['Content-Length'] = str(file_size)
    response.headers['Cache-Control'] = 'public, max-age=3600'
    response.headers['Content-Type'] = 'video/mp4'
    
    return response

@app.route('/api/chat', methods=['POST'])
def chat():
    """Simple chat endpoint that proxies messages to Google Gemini (Generative AI).

    POST JSON: { "message": "..." }
    Returns: { "reply": "..." }
    """
    data = request.get_json() or {}
    user_message = data.get('message')
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    if not GENAI_AVAILABLE:
        return jsonify({'error': 'AI chat not available. Google Generative AI not installed.'}), 503

    if GEMINI_MODEL is None:
        return jsonify({'error': 'Gemini model not configured. Set GENAI_API_KEY in environment.'}), 500

    try:
        # Use the model to generate a completion
        response = GEMINI_MODEL.generate_content(user_message)
        # .text holds the text reply in the current client
        ai_reply = getattr(response, 'text', None) or response.get('output', {}).get('text', '')
        return jsonify({'reply': ai_reply})
    except Exception as e:
        print(f"Gemini request error: {e}")
        return jsonify({'error': str(e)}), 500

# ==================== GOOGLE TRANSLATE API ENDPOINT ====================

@app.route('/api/translate', methods=['POST'])
def translate_text():
    """Translate text using Google Translate API
    
    POST JSON: {
        "text": "text to translate",
        "target_lang": "en" or "bg",
        "source_lang": "auto" (optional)
    }
    Returns: {
        "translated_text": "translated text",
        "source_lang": "detected source language",
        "target_lang": "target language",
        "success": true/false
    }
    """
    if not GOOGLE_TRANSLATE_AVAILABLE:
        return jsonify({
            'success': False,
            'error': 'Google Translate not available. Please install googletrans library.'
        }), 503
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        text = data.get('text', '').strip()
        target_lang = data.get('target_lang', 'en')
        source_lang = data.get('source_lang', 'auto')
        
        if not text:
            return jsonify({'success': False, 'error': 'No text provided'}), 400
        
        # Validate target language
        if target_lang not in ['en', 'bg']:
            return jsonify({'success': False, 'error': 'Target language must be "en" or "bg"'}), 400
        
        # Initialize translator
        translator = GoogleTranslator(source='auto', target=target_lang)
        
        print(f"Translating: '{text[:50]}...' from auto to {target_lang}")
        
        # Perform translation
        result = translator.translate(text)
        
        if result:
            return jsonify({
                'success': True,
                'translated_text': result,
                'source_lang': 'auto',
                'target_lang': target_lang,
                'original_text': text
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Translation failed - no result returned'
            }), 500
            
    except Exception as e:
        print(f"Translation error: {e}")
        return jsonify({
            'success': False,
            'error': f'Translation failed: {str(e)}'
        }), 500

@app.route('/api/translate/batch', methods=['POST'])
def translate_batch():
    """Translate multiple texts in batch
    
    POST JSON: {
        "texts": ["text1", "text2", "text3"],
        "target_lang": "en" or "bg",
        "source_lang": "auto" (optional)
    }
    Returns: {
        "translations": [
            {"original": "text1", "translated": "translated1", "success": true},
            {"original": "text2", "translated": "translated2", "success": true}
        ],
        "success": true/false
    }
    """
    if not GOOGLE_TRANSLATE_AVAILABLE:
        return jsonify({
            'success': False,
            'error': 'Google Translate not available'
        }), 503
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        texts = data.get('texts', [])
        target_lang = data.get('target_lang', 'en')
        source_lang = data.get('source_lang', 'auto')
        
        if not texts or not isinstance(texts, list):
            return jsonify({'success': False, 'error': 'No texts array provided'}), 400
        
        if len(texts) > 50:  # Limit batch size
            return jsonify({'success': False, 'error': 'Too many texts. Maximum 50 allowed.'}), 400
        
        # Validate target language
        if target_lang not in ['en', 'bg']:
            return jsonify({'success': False, 'error': 'Target language must be "en" or "bg"'}), 400
        
        # Initialize translator
        translator = GoogleTranslator(source='auto', target=target_lang)
        translations = []
        
        print(f"Batch translating {len(texts)} texts to {target_lang}")
        
        # Translate each text
        for text in texts:
            try:
                if not text or not text.strip():
                    translations.append({
                        'original': text,
                        'translated': text,
                        'success': True
                    })
                    continue
                
                result = translator.translate(text.strip())
                
                if result:
                    translations.append({
                        'original': text,
                        'translated': result,
                        'success': True
                    })
                else:
                    translations.append({
                        'original': text,
                        'translated': text,  # Keep original on failure
                        'success': False,
                        'error': 'Translation failed'
                    })
                    
            except Exception as e:
                print(f"Error translating '{text[:30]}...': {e}")
                translations.append({
                    'original': text,
                    'translated': text,  # Keep original on failure
                    'success': False,
                    'error': str(e)
                })
        
        successful_translations = sum(1 for t in translations if t['success'])
        
        return jsonify({
            'success': True,
            'translations': translations,
            'total_count': len(texts),
            'successful_count': successful_translations,
            'failed_count': len(texts) - successful_translations
        })
        
    except Exception as e:
        print(f"Batch translation error: {e}")
        return jsonify({
            'success': False,
            'error': f'Batch translation failed: {str(e)}'
        }), 500

@app.route('/api/translate/page', methods=['POST'])
def translate_page_content():
    """Translate specific page content elements
    
    POST JSON: {
        "elements": {
            "hero_title": "Помогни да направим София по-зелена",
            "hero_subtitle": "Платформа за картиране...",
            ...
        },
        "target_lang": "en"
    }
    Returns: {
        "translations": {
            "hero_title": "Help Make Sofia Greener",
            "hero_subtitle": "Platform for mapping...",
            ...
        },
        "success": true
    }
    """
    if not GOOGLE_TRANSLATE_AVAILABLE:
        return jsonify({
            'success': False,
            'error': 'Google Translate not available'
        }), 503
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        elements = data.get('elements', {})
        target_lang = data.get('target_lang', 'en')
        
        if not elements:
            return jsonify({'success': False, 'error': 'No elements provided'}), 400
        
        if target_lang not in ['en', 'bg']:
            return jsonify({'success': False, 'error': 'Target language must be "en" or "bg"'}), 400
        
        # Initialize translator
        translator = GoogleTranslator(source='auto', target=target_lang)
        translations = {}
        
        print(f"Translating page elements to {target_lang}")
        
        # Translate each element
        for key, text in elements.items():
            try:
                if not text or not text.strip():
                    translations[key] = text
                    continue
                
                result = translator.translate(text.strip())
                
                if result:
                    translations[key] = result
                else:
                    translations[key] = text  # Keep original on failure
                    
            except Exception as e:
                print(f"Error translating element '{key}': {e}")
                translations[key] = text  # Keep original on failure
        
        return jsonify({
            'success': True,
            'translations': translations,
            'target_lang': target_lang
        })
        
    except Exception as e:
        print(f"Page translation error: {e}")
        return jsonify({
            'success': False,
            'error': f'Page translation failed: {str(e)}'
        }), 500

# Express.js-style startup configuration
def create_app():
    """Application factory pattern (like Express.js app creation)"""
    # Set startup time for uptime tracking
    app.config['START_TIME'] = time.time()
    
    # Configure logging
    import logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Initialize database
    init_db()
    
    return app

if __name__ == '__main__':
    # Create and configure app
    app = create_app()
    
    # Express.js-style startup messages
    print("\n" + "="*50)
    print("PlantATree Server Starting...")
    print("="*50)
    print(f"Environment: {'Development' if app.debug else 'Production'}")
    print(f"Server URL: http://localhost:5000")
    print(f"API Endpoints:")
    print(f"   • API Info: http://localhost:5000/api")
    print(f"   • Health Check: http://localhost:5000/api/health")
    print(f"   • V1 API: http://localhost:5000/api/v1/")
    print(f"   • Admin API: http://localhost:5000/api/admin/")
    print(f"Features:")
    print(f"   ✓ Sofia Redesign Tools")
    print(f"   ✓ Air Quality Monitoring")
    print(f"   ✓ AI Chat Assistant")
    print(f"   ✓ Real-time Statistics")
    print(f"   ✓ Rate Limiting")
    print(f"   ✓ Security Headers")
    print(f"Press Ctrl+C to stop server")
    print("="*50 + "\n")
    
    try:
        app.run(
            debug=os.getenv('FLASK_DEBUG', 'True').lower() == 'true', 
            host=os.getenv('HOST', '0.0.0.0'), 
            port=int(os.getenv('PORT', '5000')),
            threaded=True  # Express.js-style concurrent request handling
        )
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"\nServer error: {e}")
    finally:
        print("Goodbye!")
        
# Export app for deployment (like module.exports in Express.js)
application = create_app()  # For WSGI servers