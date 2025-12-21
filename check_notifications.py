#!/usr/bin/env python
"""Quick test to check notifications in database"""
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / 'backend'))

# Set up environment
os.chdir('backend')
os.environ['ENV'] = 'production'

try:
    from pyramid.path import DottedNameResolver
    from app import main
    from pyramid.config import Configurator
    
    # Load settings from ini file
    import configparser
    config_file = 'production.ini'
    config = configparser.ConfigParser()
    config.read(config_file)
    
    # Get database URL
    sqlalchemy_url = config.get('app:main', 'sqlalchemy.url')
    print(f"🗄️  Database: {sqlalchemy_url}")
    
    # Create connection
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker
    
    engine = create_engine(sqlalchemy_url)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Check notifications
    from app.models import Notification, User
    
    notifs = session.query(Notification).all()
    print(f"\n📌 Total notifications in database: {len(notifs)}")
    
    if notifs:
        print("\nFirst 10 notifications:")
        for n in notifs[:10]:
            user = session.query(User).get(n.user_id)
            print(f"  ID: {n.id}, User: {user.name if user else f'User {n.user_id}'}, Title: {n.title}, Read: {n.is_read}, Created: {n.created_at}")
    else:
        print("❌ No notifications found in database!")
    
    session.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
