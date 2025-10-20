# Express.js-style router for Flask
from flask import Blueprint, request, jsonify, g
from middleware import rate_limit, validate_json, handle_errors, require_auth
import sqlite3
import json
from datetime import datetime

# Create blueprints (like Express.js routers)
api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')
admin_routes = Blueprint('admin', __name__, url_prefix='/api/admin')

# Database helper
def get_db():
    """Get database connection"""
    return sqlite3.connect('plantatree.db')

# ==================== LOCATIONS ROUTER ====================
@api_v1.route('/locations', methods=['GET'])
@handle_errors
@rate_limit(max_requests=100, window_seconds=3600)
def get_locations_v1():
    """Get all approved locations with pagination and filtering"""
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    location_type = request.args.get('type', None)
    
    offset = (page - 1) * limit
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Build query with filters
    query = '''
        SELECT id, name, description, type, latitude, longitude, created_at
        FROM locations 
        WHERE approved = TRUE
    '''
    params = []
    
    if location_type:
        query += ' AND type = ?'
        params.append(location_type)
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.extend([limit, offset])
    
    cursor.execute(query, params)
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
    
    # Get total count for pagination
    count_query = 'SELECT COUNT(*) FROM locations WHERE approved = TRUE'
    count_params = []
    if location_type:
        count_query += ' AND type = ?'
        count_params.append(location_type)
    
    cursor.execute(count_query, count_params)
    total = cursor.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'data': locations,
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total,
            'pages': (total + limit - 1) // limit
        },
        'meta': {
            'timestamp': datetime.now().isoformat(),
            'count': len(locations)
        }
    })

@api_v1.route('/locations', methods=['POST'])
@handle_errors
@validate_json('name', 'description', 'type')
@rate_limit(max_requests=50, window_seconds=3600)
def create_location_v1():
    """Create a new location with enhanced validation"""
    data = request.get_json()
    
    # Enhanced validation
    valid_types = ['park', 'trail', 'bike', 'plant', 'clean']
    if data['type'] not in valid_types:
        return jsonify({
            'error': 'Invalid location type',
            'valid_types': valid_types
        }), 400
    
    if len(data['name']) < 3 or len(data['name']) > 100:
        return jsonify({'error': 'Name must be between 3 and 100 characters'}), 400
    
    conn = get_db()
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
        getattr(g, 'user_id', 1),
        False  # Requires approval
    ))
    
    location_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Location created successfully',
        'data': {
            'id': location_id,
            'status': 'pending_approval'
        }
    }), 201

@api_v1.route('/locations/<int:location_id>', methods=['GET'])
@handle_errors
def get_location_by_id_v1(location_id):
    """Get specific location by ID"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, name, description, type, latitude, longitude, created_at
        FROM locations 
        WHERE id = ? AND approved = TRUE
    ''', (location_id,))
    
    location = cursor.fetchone()
    conn.close()
    
    if not location:
        return jsonify({'error': 'Location not found'}), 404
    
    return jsonify({
        'data': {
            'id': location[0],
            'name': location[1],
            'description': location[2],
            'type': location[3],
            'latitude': location[4],
            'longitude': location[5],
            'created_at': location[6]
        }
    })

# ==================== ECO ACTIONS ROUTER ====================
@api_v1.route('/eco-actions', methods=['GET'])
@handle_errors
@rate_limit(max_requests=100, window_seconds=3600)
def get_eco_actions_v1():
    """Get eco actions with advanced filtering and pagination"""
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    action_type = request.args.get('type', None)
    user_id = request.args.get('user_id', None, type=int)
    
    offset = (page - 1) * limit
    
    conn = get_db()
    cursor = conn.cursor()
    
    query = '''
        SELECT ea.id, ea.title, ea.description, ea.type, ea.location_name, 
               ea.image_path, ea.points, ea.created_at, u.username
        FROM eco_actions ea
        LEFT JOIN users u ON ea.user_id = u.id
        WHERE ea.approved = TRUE
    '''
    params = []
    
    if action_type:
        query += ' AND ea.type = ?'
        params.append(action_type)
    
    if user_id:
        query += ' AND ea.user_id = ?'
        params.append(user_id)
    
    query += ' ORDER BY ea.created_at DESC LIMIT ? OFFSET ?'
    params.extend([limit, offset])
    
    cursor.execute(query, params)
    
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
            'username': row[8] or 'Anonymous User'
        })
    
    conn.close()
    
    return jsonify({
        'data': actions,
        'pagination': {
            'page': page,
            'limit': limit
        }
    })

@api_v1.route('/eco-actions', methods=['POST'])
@handle_errors
@validate_json('title', 'description', 'type')
@rate_limit(max_requests=30, window_seconds=3600)
def create_eco_action_v1():
    """Create new eco action with points calculation"""
    data = request.get_json()
    
    # Points mapping
    points_map = {
        'tree': 15,
        'clean': 10,
        'bike': 5,
        'recycle': 8,
        'education': 3
    }
    
    points = points_map.get(data['type'], 5)
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO eco_actions (title, description, type, location_name, points, user_id, approved)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['title'],
        data['description'],
        data['type'],
        data.get('location_name', ''),
        points,
        getattr(g, 'user_id', 1),
        True  # Auto-approve for demo
    ))
    
    action_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': f'Eco action created! You earned {points} points!',
        'data': {
            'id': action_id,
            'points': points
        }
    }), 201

# ==================== STATISTICS ROUTER ====================
@api_v1.route('/stats', methods=['GET'])
@handle_errors
def get_platform_stats_v1():
    """Get comprehensive platform statistics"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get various statistics
    stats = {}
    
    # Locations count by type
    cursor.execute('''
        SELECT type, COUNT(*) 
        FROM locations 
        WHERE approved = TRUE 
        GROUP BY type
    ''')
    stats['locations_by_type'] = dict(cursor.fetchall())
    
    # Eco actions count by type
    cursor.execute('''
        SELECT type, COUNT(*), SUM(points) 
        FROM eco_actions 
        WHERE approved = TRUE 
        GROUP BY type
    ''')
    eco_actions_data = cursor.fetchall()
    stats['eco_actions'] = {
        row[0]: {'count': row[1], 'total_points': row[2]} 
        for row in eco_actions_data
    }
    
    # Total statistics
    cursor.execute('SELECT COUNT(*) FROM locations WHERE approved = TRUE')
    stats['total_locations'] = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM eco_actions WHERE approved = TRUE')
    stats['total_actions'] = cursor.fetchone()[0]
    
    cursor.execute('SELECT SUM(points) FROM eco_actions WHERE approved = TRUE')
    stats['total_points'] = cursor.fetchone()[0] or 0
    
    cursor.execute('SELECT COUNT(DISTINCT user_id) FROM eco_actions WHERE approved = TRUE')
    stats['active_users'] = cursor.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'data': stats,
        'meta': {
            'generated_at': datetime.now().isoformat()
        }
    })

# ==================== HEALTH CHECK ROUTER ====================
@api_v1.route('/health', methods=['GET'])
def health_check_v1():
    """API health check endpoint"""
    try:
        # Test database connection
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT 1')
        db_status = 'healthy'
        conn.close()
    except Exception:
        db_status = 'unhealthy'
    
    return jsonify({
        'status': 'healthy' if db_status == 'healthy' else 'degraded',
        'services': {
            'database': db_status,
            'api': 'healthy'
        },
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

# ==================== ADMIN ROUTES ====================
@admin_routes.route('/locations/pending', methods=['GET'])
@handle_errors
@require_auth
def get_pending_locations():
    """Get all pending locations (admin only)"""
    conn = get_db()
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
            'username': row[5] or 'Anonymous'
        })
    
    conn.close()
    return jsonify({
        'data': pending,
        'count': len(pending)
    })

@admin_routes.route('/locations/<int:location_id>/approve', methods=['PATCH'])
@handle_errors
@require_auth
def approve_location(location_id):
    """Approve a pending location"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('UPDATE locations SET approved = TRUE WHERE id = ?', (location_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'error': 'Location not found'}), 404
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Location approved successfully'
    })

# ==================== WEBSOCKET SUPPORT (Real-time features) ====================
# This would require Socket.IO for Flask, similar to Socket.io for Express.js
"""
from flask_socketio import SocketIO, emit, join_room, leave_room

socketio = SocketIO(cors_allowed_origins="*")

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    emit('status', {'msg': 'Connected to PlantATree real-time service'})

@socketio.on('join_notifications')
def handle_join_notifications(data):
    user_id = data.get('user_id')
    join_room(f'user_{user_id}')
    emit('notification', {'msg': f'Joined notifications for user {user_id}'})

@socketio.on('new_eco_action')
def handle_new_eco_action(data):
    # Broadcast to all users when new eco action is created
    emit('eco_action_created', data, broadcast=True)
"""