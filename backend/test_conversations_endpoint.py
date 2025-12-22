#!/usr/bin/env python
"""Test get_conversations endpoint with proper authentication"""

import sys
import os
import requests
import json
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User, Token

# Database connection
DATABASE_URL = 'postgresql+psycopg://neondb_owner:npg_UTPw63cQrWFd@ep-billowing-resonance-a1xc0z9x-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
engine = create_engine(DATABASE_URL, echo=False)
Session = sessionmaker(bind=engine)

# Create token for user 16
session = Session()
try:
    user = session.query(User).get(16)
    if not user:
        print("User 16 not found!")
        sys.exit(1)
    
    print(f"User: {user.name} (ID: 16)")
    
    # Check existing tokens
    tokens = session.query(Token).filter(Token.user_id == 16).all()
    print(f"Total tokens for user 16: {len(tokens)}")
    
    # Find the most recent non-expired token
    valid_token = None
    for t in tokens:
        if t.expires_at and t.expires_at > datetime.utcnow():
            valid_token = t
            print(f"Found valid token (expires {t.expires_at}): {t.token[:30]}...")
            break
    
    if not valid_token:
        # Get all tokens info
        print("No valid tokens. All tokens:")
        for i, t in enumerate(tokens[:3]):
            exp = t.expires_at or "No expiry"
            print(f"  [{i+1}] {t.token[:30]}... expires: {exp}")
        print("Creating new token...")
        
        # Create new token
        import secrets
        import hashlib
        from app.models import Token as TokenModel
        
        new_token = secrets.token_urlsafe(32)
        new_token_hash = hashlib.sha256(new_token.encode()).hexdigest()
        token_obj = TokenModel(
            user_id=16,
            token_hash=new_token_hash,
            token=new_token,  # For testing
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        session.add(token_obj)
        session.commit()
        valid_token = token_obj
        print(f"Created new token: {new_token[:30]}...")
    
    token = valid_token
    
    # Test endpoint
    print("\nTesting /api/chat/conversations endpoint...")
    headers = {
        'Authorization': f'Bearer {token.token}',
        'Content-Type': 'application/json'
    }
    
    try:
        resp = requests.get('http://localhost:6543/api/chat/conversations', headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        print(f"Response: {json.dumps(resp.json(), indent=2)}")
    except Exception as e:
        print(f"Error calling endpoint: {e}")
        
finally:
    session.close()
