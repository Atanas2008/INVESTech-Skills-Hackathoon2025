#!/usr/bin/env python3
"""
Setup default badges in the database
"""

import sqlite3
import os

def get_db_connection():
    db_path = 'infousers.db'
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def create_badges_table():
    """Create badges and user_badges tables if they don't exist"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create badges table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            icon TEXT NOT NULL,
            points_required INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create user_badges table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            badge_id INTEGER NOT NULL,
            earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (badge_id) REFERENCES badges (id),
            UNIQUE(user_id, badge_id)
        )
    ''')
    
    conn.commit()
    conn.close()

def add_default_badges():
    """Add default badges to the database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    badges = [
        ("Tree Planter", "Plant your first tree", "fas fa-tree", "points", 10),
        ("Eco Hero", "Save 100 eco points", "fas fa-recycle", "points", 100),
        ("Bike Rider", "Use a bicycle 5 times", "fas fa-bicycle", "actions", 5),
        ("Green Pioneer", "First 5 eco actions", "fas fa-seedling", "actions", 5),
        ("Water Saver", "Save water 10 times", "fas fa-tint", "points", 75),
        ("Energy Master", "Save energy 20 times", "fas fa-lightbulb", "points", 150),
        ("Cleanup Champion", "Clean up 5 places", "fas fa-broom", "actions", 3),
        ("Compost King", "Make compost 3 times", "fas fa-leaf", "actions", 2),
        ("Green Influencer", "Influence 10 people", "fas fa-users", "points", 200),
        ("Eco Warrior", "Reach 500 points", "fas fa-medal", "points", 500)
    ]
    
    for badge in badges:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO badges (name, description, icon, requirement_type, requirement_value)
                VALUES (?, ?, ?, ?, ?)
            ''', badge)
        except Exception as e:
            print(f"Error adding badge {badge[0]}: {e}")
    
    conn.commit()
    conn.close()
    print("Default badges added successfully!")

def award_badges_to_users():
    """Award some badges to existing users based on their points and actions"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get all users with their points and action counts
    cursor.execute('''
        SELECT u.id, u.username, u.points, 
               (SELECT COUNT(*) FROM eco_actions WHERE user_id = u.id AND approved = TRUE) as action_count
        FROM users u
    ''')
    users = cursor.fetchall()
    
    # Get all badges
    cursor.execute('SELECT id, name, requirement_type, requirement_value FROM badges')
    badges = cursor.fetchall()
    
    for user in users:
        user_id, username, points, action_count = user
        user_points = points or 0
        user_actions = action_count or 0
        
        print(f"Processing user {username} with {user_points} points and {user_actions} actions...")
        
        for badge in badges:
            badge_id, badge_name, req_type, req_value = badge
            
            # Check if user qualifies for this badge
            qualifies = False
            if req_type == 'points' and user_points >= req_value:
                qualifies = True
            elif req_type == 'actions' and user_actions >= req_value:
                qualifies = True
            
            # Award badge if user qualifies
            if qualifies:
                try:
                    cursor.execute('''
                        INSERT OR IGNORE INTO user_badges (user_id, badge_id)
                        VALUES (?, ?)
                    ''', (user_id, badge_id))
                    print(f"  Awarded '{badge_name}' to {username}")
                except Exception as e:
                    print(f"  Error awarding badge {badge_name} to {username}: {e}")
    
    conn.commit()
    conn.close()
    print("Badge awarding complete!")

if __name__ == '__main__':
    print("Setting up badges system...")
    
    # Create tables
    create_badges_table()
    print("Badge tables created/verified")
    
    # Add default badges
    add_default_badges()
    
    # Award badges to existing users
    award_badges_to_users()
    
    print("Badge system setup complete!")