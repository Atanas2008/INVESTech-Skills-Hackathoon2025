#!/usr/bin/env python3
"""
Admin User Management Script
Use this script to manually create admin users or manage existing user roles.
"""

import sqlite3
import getpass
from werkzeug.security import generate_password_hash

def connect_to_db():
    """Connect to the user database"""
    try:
        conn = sqlite3.connect('infousers.db')
        return conn
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        return None

def list_users():
    """List all users in the database"""
    conn = connect_to_db()
    if not conn:
        return
    
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, username, email, role, is_active, created_at 
        FROM users 
        ORDER BY created_at DESC
    ''')
    
    users = cursor.fetchall()
    
    print("\n📋 Current Users:")
    print("-" * 80)
    print(f"{'ID':<4} {'Username':<20} {'Email':<30} {'Role':<10} {'Active':<8} {'Created'}")
    print("-" * 80)
    
    for user in users:
        active_status = "✅ Yes" if user[4] else "❌ No"
        print(f"{user[0]:<4} {user[1]:<20} {user[2]:<30} {user[3]:<10} {active_status:<8} {user[5]}")
    
    if not users:
        print("No users found.")
    
    conn.close()

def create_admin_user():
    """Create a new admin user"""
    conn = connect_to_db()
    if not conn:
        return
    
    print("\n🔐 Create New Admin User")
    print("-" * 30)
    
    username = input("Username: ").strip()
    if not username:
        print("❌ Username cannot be empty")
        conn.close()
        return
    
    email = input("Email: ").strip()
    if not email:
        print("❌ Email cannot be empty")
        conn.close()
        return
    
    password = getpass.getpass("Password: ")
    if len(password) < 6:
        print("❌ Password must be at least 6 characters")
        conn.close()
        return
    
    confirm_password = getpass.getpass("Confirm Password: ")
    if password != confirm_password:
        print("❌ Passwords do not match")
        conn.close()
        return
    
    cursor = conn.cursor()
    
    # Check if username already exists
    cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
    if cursor.fetchone():
        print(f"❌ Username '{username}' already exists")
        conn.close()
        return
    
    # Check if email already exists
    cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
    if cursor.fetchone():
        print(f"❌ Email '{email}' already exists")
        conn.close()
        return
    
    # Create admin user
    hashed_password = generate_password_hash(password)
    
    try:
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, role, points, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (username, email, hashed_password, 'admin', 1000, True))
        
        conn.commit()
        
        print(f"✅ Admin user '{username}' created successfully!")
        print(f"   Email: {email}")
        print(f"   Role: admin")
        print(f"   Points: 1000")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        conn.rollback()
    
    conn.close()

def promote_user_to_admin():
    """Promote an existing user to admin"""
    conn = connect_to_db()
    if not conn:
        return
    
    print("\n⬆️ Promote User to Admin")
    print("-" * 25)
    
    # Show regular users
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, username, email, role 
        FROM users 
        WHERE role = 'regular' AND is_active = 1
        ORDER BY username
    ''')
    
    regular_users = cursor.fetchall()
    
    if not regular_users:
        print("❌ No regular users found to promote")
        conn.close()
        return
    
    print("Regular users:")
    for user in regular_users:
        print(f"  {user[0]}: {user[1]} ({user[2]})")
    
    try:
        user_id = int(input("\nEnter user ID to promote: "))
    except ValueError:
        print("❌ Invalid user ID")
        conn.close()
        return
    
    # Verify user exists and is regular
    cursor.execute('''
        SELECT username, email, role 
        FROM users 
        WHERE id = ? AND role = 'regular' AND is_active = 1
    ''', (user_id,))
    
    user = cursor.fetchone()
    if not user:
        print("❌ User not found or not eligible for promotion")
        conn.close()
        return
    
    # Confirm promotion
    confirm = input(f"Promote '{user[0]}' ({user[1]}) to admin? (y/N): ").strip().lower()
    if confirm != 'y':
        print("❌ Promotion cancelled")
        conn.close()
        return
    
    # Promote user
    try:
        cursor.execute('''
            UPDATE users 
            SET role = 'admin', points = points + 500 
            WHERE id = ?
        ''', (user_id,))
        
        conn.commit()
        
        print(f"✅ User '{user[0]}' promoted to admin successfully!")
        print(f"   Added 500 bonus points")
        
    except Exception as e:
        print(f"❌ Error promoting user: {e}")
        conn.rollback()
    
    conn.close()

def demote_admin_to_user():
    """Demote an admin user to regular user"""
    conn = connect_to_db()
    if not conn:
        return
    
    print("\n⬇️ Demote Admin to Regular User")
    print("-" * 30)
    
    # Show admin users (except the main admin)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, username, email, role 
        FROM users 
        WHERE role = 'admin' AND is_active = 1 AND email != 'admin@plantatree.com'
        ORDER BY username
    ''')
    
    admin_users = cursor.fetchall()
    
    if not admin_users:
        print("❌ No admin users found to demote (main admin is protected)")
        conn.close()
        return
    
    print("Admin users:")
    for user in admin_users:
        print(f"  {user[0]}: {user[1]} ({user[2]})")
    
    try:
        user_id = int(input("\nEnter user ID to demote: "))
    except ValueError:
        print("❌ Invalid user ID")
        conn.close()
        return
    
    # Verify user exists and is admin
    cursor.execute('''
        SELECT username, email, role 
        FROM users 
        WHERE id = ? AND role = 'admin' AND is_active = 1 AND email != 'admin@plantatree.com'
    ''', (user_id,))
    
    user = cursor.fetchone()
    if not user:
        print("❌ User not found, not admin, or protected user")
        conn.close()
        return
    
    # Confirm demotion
    confirm = input(f"Demote '{user[0]}' ({user[1]}) to regular user? (y/N): ").strip().lower()
    if confirm != 'y':
        print("❌ Demotion cancelled")
        conn.close()
        return
    
    # Demote user
    try:
        cursor.execute('''
            UPDATE users 
            SET role = 'regular' 
            WHERE id = ?
        ''', (user_id,))
        
        conn.commit()
        
        print(f"✅ User '{user[0]}' demoted to regular user successfully!")
        
    except Exception as e:
        print(f"❌ Error demoting user: {e}")
        conn.rollback()
    
    conn.close()

def toggle_user_status():
    """Toggle user active/inactive status"""
    conn = connect_to_db()
    if not conn:
        return
    
    print("\n🔄 Toggle User Status")
    print("-" * 20)
    
    # Show all users
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, username, email, role, is_active 
        FROM users 
        WHERE email != 'admin@plantatree.com'
        ORDER BY username
    ''')
    
    users = cursor.fetchall()
    
    if not users:
        print("❌ No users found to modify (main admin is protected)")
        conn.close()
        return
    
    print("Users:")
    for user in users:
        status = "Active" if user[4] else "Inactive"
        print(f"  {user[0]}: {user[1]} ({user[2]}) - {user[3]} - {status}")
    
    try:
        user_id = int(input("\nEnter user ID to toggle status: "))
    except ValueError:
        print("❌ Invalid user ID")
        conn.close()
        return
    
    # Get user info
    cursor.execute('''
        SELECT username, email, role, is_active 
        FROM users 
        WHERE id = ? AND email != 'admin@plantatree.com'
    ''', (user_id,))
    
    user = cursor.fetchone()
    if not user:
        print("❌ User not found or protected user")
        conn.close()
        return
    
    new_status = not user[3]
    status_text = "activate" if new_status else "deactivate"
    
    # Confirm toggle
    confirm = input(f"{status_text.capitalize()} '{user[0]}' ({user[1]})? (y/N): ").strip().lower()
    if confirm != 'y':
        print("❌ Operation cancelled")
        conn.close()
        return
    
    # Toggle status
    try:
        cursor.execute('''
            UPDATE users 
            SET is_active = ? 
            WHERE id = ?
        ''', (new_status, user_id))
        
        conn.commit()
        
        print(f"✅ User '{user[0]}' {status_text}d successfully!")
        
    except Exception as e:
        print(f"❌ Error toggling user status: {e}")
        conn.rollback()
    
    conn.close()

def main():
    """Main menu"""
    while True:
        print("\n" + "="*50)
        print("🔧 PlantATree Admin User Management")
        print("="*50)
        print("1. List all users")
        print("2. Create new admin user")
        print("3. Promote regular user to admin")
        print("4. Demote admin to regular user")
        print("5. Toggle user active/inactive status")
        print("6. Exit")
        print("-"*50)
        
        try:
            choice = input("Choose an option (1-6): ").strip()
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        
        if choice == '1':
            list_users()
        elif choice == '2':
            create_admin_user()
        elif choice == '3':
            promote_user_to_admin()
        elif choice == '4':
            demote_admin_to_user()
        elif choice == '5':
            toggle_user_status()
        elif choice == '6':
            print("\n👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please select 1-6.")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    print("🚀 Starting Admin User Management...")
    print("Make sure you're in the directory with infousers.db")
    
    # Check if database exists
    import os
    if not os.path.exists('infousers.db'):
        print("❌ Database 'infousers.db' not found!")
        print("   Make sure the Flask app has been run at least once to create the database.")
        exit(1)
    
    main()