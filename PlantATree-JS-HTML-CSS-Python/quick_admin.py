#!/usr/bin/env python3
"""
Quick Admin Actions Script
Provides quick commands for common admin tasks
"""
import sys
import os
import sqlite3
from datetime import datetime

def get_db_connection():
    conn = sqlite3.connect('infousers.db')
    conn.row_factory = sqlite3.Row
    return conn

def quick_delete_action(action_id):
    """Quickly delete an action by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT title FROM eco_actions WHERE id = ?', (action_id,))
    action = cursor.fetchone()
    
    if action:
        cursor.execute('DELETE FROM eco_actions WHERE id = ?', (action_id,))
        conn.commit()
        print(f"✅ Deleted action: {action['title']}")
    else:
        print(f"❌ Action {action_id} not found")
    
    conn.close()

def quick_list_actions():
    """Quick list of recent actions"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT ea.id, ea.title, ea.approved, u.username, ea.created_at
        FROM eco_actions ea
        LEFT JOIN users u ON ea.user_id = u.id
        ORDER BY ea.created_at DESC
        LIMIT 10
    ''')
    
    actions = cursor.fetchall()
    
    print("\n🔍 Latest 10 eco actions:")
    print("-" * 60)
    for action in actions:
        status = "✅" if action['approved'] else "⏳"
        print(f"{status} ID:{action['id']} | {action['title'][:40]}")
        print(f"   By: {action['username'] or 'Unknown'} | {action['created_at']}")
        print()
    
    conn.close()

def quick_approve_all():
    """Approve all pending actions"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('UPDATE eco_actions SET approved = TRUE WHERE approved = FALSE')
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    
    print(f"✅ Approved {affected} pending actions")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("🌱 Quick Admin Commands:")
        print("  python quick_admin.py list          - List recent actions")
        print("  python quick_admin.py delete [ID]   - Delete action by ID")
        print("  python quick_admin.py approve-all   - Approve all pending")
        print("  python quick_admin.py full          - Open full admin menu")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if not os.path.exists('infousers.db'):
        print("❌ Database not found!")
        sys.exit(1)
    
    if command == 'list':
        quick_list_actions()
    elif command == 'delete' and len(sys.argv) > 2:
        try:
            action_id = int(sys.argv[2])
            quick_delete_action(action_id)
        except ValueError:
            print("❌ Invalid action ID")
    elif command == 'approve-all':
        quick_approve_all()
    elif command == 'full':
        os.system('python admin_eco_manager.py')
    else:
        print("❌ Invalid command")