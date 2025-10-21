
"""
Admin Management Script for Eco Actions
Provides functionality to manage posts, users, and system administration
"""
import sqlite3
from datetime import datetime
import sys
import os

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect('infousers.db')
    conn.row_factory = sqlite3.Row
    return conn

def list_all_actions():
    """List all eco actions with details"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT ea.id, ea.title, ea.description, ea.type, ea.location_name, 
               ea.points, ea.approved, ea.created_at, u.username, u.email
        FROM eco_actions ea
        LEFT JOIN users u ON ea.user_id = u.id
        ORDER BY ea.created_at DESC
    ''')
    
    actions = cursor.fetchall()
    conn.close()
    
    if not actions:
        print("📭 No eco actions found.")
        return
    
    print(f"\n📋 Found {len(actions)} eco actions:")
    print("=" * 80)
    
    for action in actions:
        status = " Approved" if action['approved'] else "⏳ Pending"
        print(f"ID: {action['id']} | {status}")
        print(f"Title: {action['title']}")
        print(f"Type: {action['type']} | Points: {action['points']}")
        print(f"User: {action['username'] or 'Unknown'} ({action['email'] or 'N/A'})")
        print(f"Location: {action['location_name'] or 'Not specified'}")
        print(f"Created: {action['created_at']}")
        print(f"Description: {action['description'][:100]}...")
        print("-" * 80)

def delete_action(action_id):
    """Delete an eco action by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT title, username FROM eco_actions ea LEFT JOIN users u ON ea.user_id = u.id WHERE ea.id = ?', (action_id,))
    action = cursor.fetchone()
    
    if not action:
        print(f" Action with ID {action_id} not found.")
        return False
    
    print(f"\n  You are about to delete:")
    print(f"   Title: {action['title']}")
    print(f"   User: {action['username'] or 'Unknown'}")
    
    confirm = input("\nAre you sure? Type 'DELETE' to confirm: ")
    
    if confirm == 'DELETE':
        cursor.execute('DELETE FROM eco_actions WHERE id = ?', (action_id,))
        conn.commit()
        print(f" Action {action_id} deleted successfully.")
        return True
    else:
        print(" Deletion cancelled.")
        return False
    
    conn.close()

def approve_action(action_id):
    """Approve a pending eco action"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT title, approved FROM eco_actions WHERE id = ?', (action_id,))
    action = cursor.fetchone()
    
    if not action:
        print(f" Action with ID {action_id} not found.")
        return False
    
    if action['approved']:
        print(f"ℹ  Action '{action['title']}' is already approved.")
        return False
    
    cursor.execute('UPDATE eco_actions SET approved = TRUE WHERE id = ?', (action_id,))
    conn.commit()
    conn.close()
    
    print(f" Action '{action['title']}' approved successfully.")
    return True

def reject_action(action_id):
    """Reject/unapprove an eco action"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT title, approved FROM eco_actions WHERE id = ?', (action_id,))
    action = cursor.fetchone()
    
    if not action:
        print(f" Action with ID {action_id} not found.")
        return False
    
    cursor.execute('UPDATE eco_actions SET approved = FALSE WHERE id = ?', (action_id,))
    conn.commit()
    conn.close()
    
    status = "rejected" if action['approved'] else "kept as pending"
    print(f" Action '{action['title']}' {status}.")
    return True

def list_users():
    """List all users"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT u.id, u.username, u.email, u.role, u.created_at,
               COUNT(ea.id) as action_count,
               COALESCE(SUM(ea.points), 0) as total_points
        FROM users u
        LEFT JOIN eco_actions ea ON u.id = ea.user_id AND ea.approved = TRUE
        GROUP BY u.id
        ORDER BY total_points DESC
    ''')
    
    users = cursor.fetchall()
    conn.close()
    
    if not users:
        print(" No users found.")
        return
    
    print(f"\n Found {len(users)} users:")
    print("=" * 80)
    
    for user in users:
        role_emoji = "👑" if user['role'] == 'admin' else "👤"
        print(f"{role_emoji} ID: {user['id']} | {user['username']} ({user['email']})")
        print(f"   Role: {user['role']} | Actions: {user['action_count']} | Points: {user['total_points']}")
        print(f"   Joined: {user['created_at']}")
        print("-" * 80)

def delete_user(user_id):
    """Delete a user and their actions"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT username, email FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    
    if not user:
        print(f" User with ID {user_id} not found.")
        return False
    
    cursor.execute('SELECT COUNT(*) as count FROM eco_actions WHERE user_id = ?', (user_id,))
    action_count = cursor.fetchone()['count']
    
    print(f"\n  You are about to delete user:")
    print(f"   Username: {user['username']}")
    print(f"   Email: {user['email']}")
    print(f"   Actions: {action_count}")
    print(f"     This will also delete all their eco actions!")
    
    confirm = input("\nType 'DELETE USER' to confirm: ")
    
    if confirm == 'DELETE USER':
        cursor.execute('DELETE FROM eco_actions WHERE user_id = ?', (user_id,))
        cursor.execute('DELETE FROM sessions WHERE user_id = ?', (user_id,))
        cursor.execute('DELETE FROM user_badges WHERE user_id = ?', (user_id,))
        cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
        
        conn.commit()
        print(f" User {user['username']} and {action_count} actions deleted successfully.")
        return True
    else:
        print(" User deletion cancelled.")
        return False
    
    conn.close()

def show_statistics():
    """Show system statistics"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) as count FROM users')
    total_users = cursor.fetchone()['count']
    
    cursor.execute('SELECT COUNT(*) as count FROM eco_actions')
    total_actions = cursor.fetchone()['count']
    
    cursor.execute('SELECT COUNT(*) as count FROM eco_actions WHERE approved = TRUE')
    approved_actions = cursor.fetchone()['count']
    
    cursor.execute('SELECT COUNT(*) as count FROM eco_actions WHERE approved = FALSE')
    pending_actions = cursor.fetchone()['count']
    
    cursor.execute('SELECT COALESCE(SUM(points), 0) as total FROM eco_actions WHERE approved = TRUE')
    total_points = cursor.fetchone()['total']
    
    cursor.execute('''
        SELECT type, COUNT(*) as count, COALESCE(SUM(points), 0) as points
        FROM eco_actions WHERE approved = TRUE
        GROUP BY type
        ORDER BY count DESC
    ''')
    action_types = cursor.fetchall()
    
    conn.close()
    
    print("\n System Statistics")
    print("=" * 50)
    print(f" Total Users: {total_users}")
    print(f" Total Actions: {total_actions}")
    print(f" Approved Actions: {approved_actions}")
    print(f" Pending Actions: {pending_actions}")
    print(f" Total Points: {total_points}")
    print(f" Charity Donations: {total_points // 500} BGN ({total_points % 500}/500 to next)")
    
    if action_types:
        print(f"\n📈 Actions by Type:")
        for action_type in action_types:
            type_names = {
                'tree': ' Trees',
                'clean': ' Cleaning',
                'bike': ' Biking',
                'recycle': ' Recycling'
            }
            name = type_names.get(action_type['type'], action_type['type'])
            print(f"   {name}: {action_type['count']} actions, {action_type['points']} points")

def main_menu():
    """Display main menu and handle user input"""
    while True:
        print("\n PlantATree Admin Management")
        print("=" * 40)
        print("1. List all eco actions")
        print("2. Delete eco action")
        print("3. Approve eco action")
        print("4. Reject/Unapprove eco action")
        print("5. List all users")
        print("6. Delete user")
        print("7. Show statistics")
        print("8. Exit")
        print("-" * 40)
        
        choice = input("Enter your choice (1-8): ").strip()
        
        if choice == '1':
            list_all_actions()
        elif choice == '2':
            try:
                action_id = int(input("Enter action ID to delete: "))
                delete_action(action_id)
            except ValueError:
                print(" Invalid action ID. Please enter a number.")
        elif choice == '3':
            try:
                action_id = int(input("Enter action ID to approve: "))
                approve_action(action_id)
            except ValueError:
                print(" Invalid action ID. Please enter a number.")
        elif choice == '4':
            try:
                action_id = int(input("Enter action ID to reject: "))
                reject_action(action_id)
            except ValueError:
                print(" Invalid action ID. Please enter a number.")
        elif choice == '5':
            list_users()
        elif choice == '6':
            try:
                user_id = int(input("Enter user ID to delete: "))
                delete_user(user_id)
            except ValueError:
                print(" Invalid user ID. Please enter a number.")
        elif choice == '7':
            show_statistics()
        elif choice == '8':
            print("👋 Goodbye!")
            break
        else:
            print(" Invalid choice. Please enter 1-8.")

if __name__ == '__main__':
    if not os.path.exists('infousers.db'):
        print(" Database file 'infousers.db' not found!")
        print("Make sure you're running this script from the correct directory.")
        sys.exit(1)
    
    print("🌱 PlantATree Admin Management Script")
    print("This script allows you to manage eco actions and users.")
    
    main_menu()