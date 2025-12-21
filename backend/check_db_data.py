#!/usr/bin/env python
"""
Simple script to check database data - verify notifications exist
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
else:
    print(f"⚠️  .env file not found at {env_path}")
    print("Looking for DATABASE_URL in environment variables...")

# Get database URL
database_url = os.environ.get('DATABASE_URL')
if not database_url:
    print("❌ DATABASE_URL not set in environment variables")
    exit(1)

# Ensure it's using psycopg3
if database_url.startswith('postgresql://') and not database_url.startswith('postgresql+psycopg://'):
    database_url = database_url.replace('postgresql://', 'postgresql+psycopg://', 1)

print(f"📊 Database URL: {database_url[:50]}...")

try:
    # Connect to database
    engine = create_engine(database_url, echo=False)
    connection = engine.connect()
    
    # Check if tables exist
    print("\n📋 Checking tables...")
    result = connection.execute(text("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    """))
    tables = [row[0] for row in result]
    print(f"   Tables: {', '.join(tables)}")
    
    # Check notifications table exists
    if 'notifications' in tables:
        print("\n✅ notifications table exists")
        
        # Count notifications
        result = connection.execute(text("SELECT COUNT(*) FROM notifications"))
        count = result.scalar()
        print(f"   Total notifications: {count}")
        
        # List all notifications
        if count > 0:
            result = connection.execute(text("""
                SELECT id, user_id, title, is_read, created_at
                FROM notifications
                ORDER BY created_at DESC
                LIMIT 10
            """))
            print("   Recent notifications:")
            for row in result:
                print(f"     ID: {row[0]}, User: {row[1]}, Title: {row[2]}, Read: {row[3]}, Created: {row[4]}")
        else:
            print("   ⚠️  No notifications in database")
    else:
        print("❌ notifications table NOT found")
    
    # Check users table
    print("\n📋 Checking users...")
    if 'users' in tables:
        result = connection.execute(text("SELECT COUNT(*) FROM users"))
        count = result.scalar()
        print(f"   Total users: {count}")
        
        result = connection.execute(text("""
            SELECT id, name, email, role
            FROM users
            LIMIT 5
        """))
        print("   Sample users:")
        for row in result:
            print(f"     ID: {row[0]}, Name: {row[1]}, Email: {row[2]}, Role: {row[3]}")
    
    # Check appointments
    print("\n📋 Checking appointments...")
    if 'appointments' in tables:
        result = connection.execute(text("SELECT COUNT(*) FROM appointments"))
        count = result.scalar()
        print(f"   Total appointments: {count}")
        
        result = connection.execute(text("""
            SELECT id, patient_id, doctor_id, status, created_at
            FROM appointments
            ORDER BY created_at DESC
            LIMIT 5
        """))
        print("   Recent appointments:")
        for row in result:
            print(f"     ID: {row[0]}, Patient: {row[1]}, Doctor: {row[2]}, Status: {row[3]}, Created: {row[4]}")
    
    connection.close()
    print("\n✅ Database check complete")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
