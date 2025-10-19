from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime
import sqlite3
from werkzeug.utils import secure_filename
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# Ambee API Configuration
AMBEE_API_KEY = 'bdeedc716f3882fa7005eaf1c617bdeb943df52c1b3f3cc43b6334daf19689cc'
AMBEE_BASE_URL = 'https://api.ambeedata.com'

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Cloud database configuration
CLOUD_DB_URL = os.environ.get('DATABASE_URL')  # For Heroku/Railway/etc
USE_CLOUD_DB = CLOUD_DB_URL is not None

if USE_CLOUD_DB:
    print("🌐 Using cloud database:", CLOUD_DB_URL[:50] + "...")
else:
    print("💾 Using local SQLite database")

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database connection function
def get_db_connection():
    """Get database connection - local SQLite or cloud PostgreSQL"""
    if USE_CLOUD_DB:
        # For cloud deployment with PostgreSQL
        try:
            import psycopg2
            return psycopg2.connect(CLOUD_DB_URL)
        except ImportError:
            print("⚠️ psycopg2 not installed, falling back to SQLite")
            return sqlite3.connect('plantatree.db')
        except Exception as e:
            print(f"⚠️ Cloud DB connection failed: {e}, falling back to SQLite")
            return sqlite3.connect('plantatree.db')
    else:
        return sqlite3.connect('plantatree.db')

# Database initialization
def init_db():
    """Initialize database with required tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            points INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Locations table
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
    
    # Eco Actions table
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
    
    # Badges table
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
    
    # User Badges table (many-to-many)
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
    
    # Sofia Redesigns table for map redesign functionality
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
    
    # Insert sample data if tables are empty
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
    
    # Insert sample badges
    cursor.execute('SELECT COUNT(*) FROM badges')
    if cursor.fetchone()[0] == 0:
        sample_badges = [
            ('Tree Planter', 'Засади първото си дърво', '🌳', 'trees', 1),
            ('Eco Hero', 'Направи 10 еко действия', '♻️', 'actions', 10),
            ('Green Warrior', 'Събери 100 точки', '🏆', 'points', 100),
            ('Nature Lover', 'Посети 5 различни зелени зони', '🌿', 'locations', 5),
            ('Bike Rider', 'Използвай велосипед 10 пъти', '🚴', 'bike_rides', 10)
        ]
        
        cursor.executemany('''
            INSERT INTO badges (name, description, icon, requirement_type, requirement_value)
            VALUES (?, ?, ?, ?, ?)
        ''', sample_badges)
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Routes
@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files (CSS, JS, images)"""
    return send_from_directory('.', filename)

# API Routes
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
        
        conn = sqlite3.connect('plantatree.db')
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
            data.get('user_id', 1),  # Default user for demo
            False  # Requires approval
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
               ea.image_path, ea.points, ea.created_at, u.username
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
            'username': row[8] or 'Анонимен потребител'
        })
    
    conn.close()
    return jsonify(actions)

@app.route('/api/eco-actions', methods=['POST'])
def add_eco_action():
    """Add a new eco action"""
    try:
        # Handle file upload if present
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
        
        # Get form data
        title = request.form.get('title')
        description = request.form.get('description')
        action_type = request.form.get('type')
        location_name = request.form.get('location')
        
        # Calculate points based on action type
        points_map = {
            'tree': 15,
            'clean': 10,
            'bike': 5,
            'recycle': 8
        }
        points = points_map.get(action_type, 5)
        
        conn = sqlite3.connect('plantatree.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO eco_actions (title, description, type, location_name, image_path, points, user_id, approved)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            title, description, action_type, location_name, 
            image_path, points, 1, True  # Auto-approve for demo
        ))
        
        action_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Еко действието е добавено! Получихте {points} точки!',
            'action_id': action_id,
            'points': points
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/charity-stats', methods=['GET'])
def get_charity_stats():
    """Get charity statistics - total points from all eco actions"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Calculate total points from all approved eco actions
        cursor.execute('SELECT SUM(points) FROM eco_actions WHERE approved = TRUE')
        total_points = cursor.fetchone()[0] or 0
        
        # Calculate donations made (every 500 points = 1 BGN donation)
        donations_made = total_points // 500
        total_donated = donations_made * 1.0  # 1 BGN per 500 points
        
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
        period = request.args.get('period', 'all')  # all, week, month, year
        action_type = request.args.get('type', 'all')  # all, tree, clean, bike, recycle
        limit = int(request.args.get('limit', 50))
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Base query for user statistics
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
        
        # Add time period filter
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
            
            # Determine user level based on points
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
    conn = sqlite3.connect('plantatree.db')
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
    conn = sqlite3.connect('plantatree.db')
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

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Ресурсът не е намерен'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Вътрешна грешка на сървъра'}), 500

# Admin routes (for future implementation)
@app.route('/api/admin/locations/pending', methods=['GET'])
def get_pending_locations():
    """Get locations waiting for approval"""
    conn = sqlite3.connect('plantatree.db')
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
    conn = sqlite3.connect('plantatree.db')
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
        conn = sqlite3.connect('plantatree.db')
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
        conn = sqlite3.connect('plantatree.db')
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
        conn = sqlite3.connect('plantatree.db')
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
        conn = sqlite3.connect('plantatree.db')
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
        conn = sqlite3.connect('plantatree.db')
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

if __name__ == '__main__':
    print("🌱 PlantATree Server стартира...")
    print("📍 Отворете http://localhost:5000 в браузъра")
    print("🔧 За спиране използвайте Ctrl+C")
    app.run(debug=True, host='0.0.0.0', port=5000)