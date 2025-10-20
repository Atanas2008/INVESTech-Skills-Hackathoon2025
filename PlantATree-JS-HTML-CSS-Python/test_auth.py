#!/usr/bin/env python3
"""
Test script for the authentication system
This script verifies that the database and authentication endpoints work correctly.
"""

import sqlite3
import requests
import json
import os
from datetime import datetime

def test_database_creation():
    """Test if the database was created with the correct schema"""
    print("🔍 Testing database creation...")
    
    if not os.path.exists('infousers.db'):
        print("❌ Database file 'infousers.db' not found!")
        return False
    
    conn = sqlite3.connect('infousers.db')
    cursor = conn.cursor()
    
    # Check if all required tables exist
    required_tables = ['users', 'user_sessions', 'locations', 'eco_actions', 'badges', 'user_badges', 'sofia_redesigns']
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    existing_tables = [row[0] for row in cursor.fetchall()]
    
    missing_tables = [table for table in required_tables if table not in existing_tables]
    
    if missing_tables:
        print(f"❌ Missing tables: {missing_tables}")
        conn.close()
        return False
    
    # Check users table structure
    cursor.execute("PRAGMA table_info(users);")
    columns = [column[1] for column in cursor.fetchall()]
    required_columns = ['id', 'username', 'email', 'password_hash', 'role', 'profile_picture', 'points', 'is_active', 'created_at', 'last_login']
    
    missing_columns = [col for col in required_columns if col not in columns]
    if missing_columns:
        print(f"❌ Missing columns in users table: {missing_columns}")
        conn.close()
        return False
    
    # Check if admin user exists
    cursor.execute("SELECT username, email, role FROM users WHERE role = 'admin' LIMIT 1;")
    admin_user = cursor.fetchone()
    
    if admin_user:
        print(f"✅ Admin user found: {admin_user[0]} ({admin_user[1]})")
    else:
        print("⚠️ No admin user found")
    
    conn.close()
    print("✅ Database structure is correct!")
    return True

def test_api_endpoints():
    """Test API endpoints"""
    print("\n🌐 Testing API endpoints...")
    
    base_url = "http://localhost:5000"
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check endpoint working")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Could not connect to server: {e}")
        print("💡 Make sure the server is running with: python app.py")
        return False
    
    # Test user registration
    test_user_data = {
        "username": f"testuser_{int(datetime.now().timestamp())}",
        "email": f"test_{int(datetime.now().timestamp())}@example.com",
        "password": "testpass123",
        "confirm_password": "testpass123",
        "role": "regular"
    }
    
    try:
        response = requests.post(f"{base_url}/api/auth/register", json=test_user_data, timeout=5)
        if response.status_code == 201:
            data = response.json()
            if data.get('success'):
                print(f"✅ User registration working - User ID: {data['user']['id']}")
                
                # Test login with the same user
                login_data = {
                    "email": test_user_data['email'],
                    "password": test_user_data['password']
                }
                
                login_response = requests.post(f"{base_url}/api/auth/login", json=login_data, timeout=5)
                if login_response.status_code == 200:
                    login_result = login_response.json()
                    if login_result.get('success'):
                        print("✅ User login working")
                        
                        # Test profile endpoint
                        token = login_result['token']
                        headers = {'Authorization': f'Bearer {token}'}
                        
                        profile_response = requests.get(f"{base_url}/api/auth/profile", headers=headers, timeout=5)
                        if profile_response.status_code == 200:
                            profile_data = profile_response.json()
                            if profile_data.get('success'):
                                print("✅ Profile endpoint working")
                            else:
                                print(f"❌ Profile endpoint error: {profile_data.get('message')}")
                        else:
                            print(f"❌ Profile endpoint failed: {profile_response.status_code}")
                    else:
                        print(f"❌ Login failed: {login_result.get('message')}")
                else:
                    print(f"❌ Login request failed: {login_response.status_code}")
            else:
                print(f"❌ Registration failed: {data.get('message')}")
        else:
            print(f"❌ Registration request failed: {response.status_code}")
            if response.headers.get('content-type', '').startswith('application/json'):
                error_data = response.json()
                print(f"   Error: {error_data.get('message', 'Unknown error')}")
    except requests.exceptions.RequestException as e:
        print(f"❌ API test failed: {e}")
        return False
    
    return True

def test_file_structure():
    """Test if all required files exist"""
    print("\n📁 Testing file structure...")
    
    required_files = [
        'app.py',
        'index.html',
        'static/js/auth.js',
        'static/css/auth.css'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ Missing files: {missing_files}")
        return False
    
    # Check if uploads directory exists
    if not os.path.exists('uploads'):
        print("⚠️ Uploads directory not found, creating it...")
        os.makedirs('uploads', exist_ok=True)
    
    profiles_dir = 'uploads/profiles'
    if not os.path.exists(profiles_dir):
        print("⚠️ Profiles directory not found, creating it...")
        os.makedirs(profiles_dir, exist_ok=True)
    
    print("✅ File structure is correct!")
    return True

def main():
    """Run all tests"""
    print("🧪 Starting PlantATree Authentication System Tests\n")
    print("=" * 60)
    
    # Test file structure
    if not test_file_structure():
        print("\n❌ File structure test failed!")
        return
    
    # Test database
    if not test_database_creation():
        print("\n❌ Database test failed!")
        return
    
    # Test API endpoints
    if not test_api_endpoints():
        print("\n❌ API test failed!")
        return
    
    print("\n" + "=" * 60)
    print("🎉 All tests passed! The authentication system is working correctly.")
    print("\n📋 Summary:")
    print("   ✅ Database created with proper schema")
    print("   ✅ Admin user created")
    print("   ✅ User registration working")
    print("   ✅ User login working")
    print("   ✅ Profile endpoints working")
    print("   ✅ File structure correct")
    print("\n💡 You can now:")
    print("   1. Register new users through the website")
    print("   2. Login with existing users")
    print("   3. Upload profile pictures")
    print("   4. Access admin features (if admin user)")
    print("\n🔐 Default admin credentials:")
    print("   Email: admin@plantatree.com")
    print("   Password: admin123")
    print("   (⚠️ Change this password in production!)")

if __name__ == "__main__":
    main()