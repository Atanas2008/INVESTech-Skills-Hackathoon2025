from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime
import sqlite3
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database initialization
def init_db():
    """Initialize SQLite database with required tables"""
    conn = sqlite3.connect('plantatree.db')
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
    conn = sqlite3.connect('plantatree.db')
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
    conn = sqlite3.connect('plantatree.db')
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

if __name__ == '__main__':
    print("🌱 PlantATree Server стартира...")
    print("📍 Отворете http://localhost:5000 в браузъра")
    print("🔧 За спиране използвайте Ctrl+C")
    app.run(debug=True, host='0.0.0.0', port=5000)