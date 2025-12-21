#!/usr/bin/env python
"""
Simple test script untuk check database dan notifications system
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.models import User, Doctor, Appointment, Notification
from app.views.auth import get_db_session
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
import configparser

# Load database config
config = configparser.ConfigParser()
if os.path.exists('production.ini'):
    config.read('production.ini')
elif os.path.exists('development.ini'):
    config.read('development.ini')
else:
    print("❌ No config file found!")
    sys.exit(1)

sqlalchemy_url = config.get('app:main', 'sqlalchemy.url')
print(f"📊 Testing Database Connection")
print(f"URL: {sqlalchemy_url}\n")

try:
    # Create engine
    engine = create_engine(sqlalchemy_url)
    
    # Test connection
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print(f"✅ Database connection successful\n")
    
    # Check tables
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"📋 Tables in database:")
    for table in sorted(tables):
        print(f"   - {table}")
    
    # Check if notifications table exists
    if 'notifications' in tables:
        print(f"\n✅ notifications table EXISTS")
        
        # Get columns
        columns = inspector.get_columns('notifications')
        print(f"   Columns:")
        for col in columns:
            print(f"     - {col['name']} ({col['type']})")
    else:
        print(f"\n❌ notifications table MISSING - Need to run: alembic upgrade head")
    
    # Check if message table exists
    if 'messages' in tables:
        print(f"\n✅ messages table EXISTS")
    else:
        print(f"\n⚠️  messages table MISSING")
    
    # Create session and check data
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Count users
        user_count = session.query(User).count()
        print(f"\n👥 Users: {user_count}")
        
        # Count doctors
        doctor_count = session.query(Doctor).count()
        print(f"🏥 Doctors: {doctor_count}")
        
        # Count appointments
        apt_count = session.query(Appointment).count()
        print(f"📅 Appointments: {apt_count}")
        
        # Count notifications
        try:
            notif_count = session.query(Notification).count()
            print(f"🔔 Notifications: {notif_count}")
            
            # Show recent notifications
            if notif_count > 0:
                recent_notifs = session.query(Notification).order_by(Notification.created_at.desc()).limit(5).all()
                print(f"\n   Recent notifications:")
                for notif in recent_notifs:
                    user = session.query(User).get(notif.user_id)
                    print(f"     - ID {notif.id}: {notif.title} → {user.name if user else f'User {notif.user_id}'}")
        except Exception as e:
            print(f"⚠️  Cannot query notifications: {str(e)}")
    
    finally:
        session.close()
    
    print(f"\n✅ Database test complete!")

except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
