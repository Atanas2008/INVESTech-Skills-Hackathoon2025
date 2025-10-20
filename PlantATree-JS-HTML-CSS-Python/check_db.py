import sqlite3

def check_database():
    try:
        conn = sqlite3.connect('infousers.db')
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        print("Tables in database:", tables)
        
        # Check if user_sessions table exists
        if 'user_sessions' in tables:
            cursor.execute("SELECT COUNT(*) FROM user_sessions")
            session_count = cursor.fetchone()[0]
            print(f"Active sessions: {session_count}")
        
        # Check users table
        if 'users' in tables:
            cursor.execute("SELECT id, username, points FROM users LIMIT 5")
            users = cursor.fetchall()
            print("Sample users:", users)
        
        # Check badges table
        if 'badges' in tables:
            cursor.execute("SELECT COUNT(*) FROM badges")
            badge_count = cursor.fetchone()[0]
            print(f"Total badges: {badge_count}")
        
        conn.close()
        
    except Exception as e:
        print(f"Database error: {e}")

if __name__ == '__main__':
    check_database()