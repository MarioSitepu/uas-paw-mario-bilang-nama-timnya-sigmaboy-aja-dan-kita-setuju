#!/usr/bin/env python
"""Simple test to see actual error"""
import requests
import json

print("Testing POST /api/auth/login...")
try:
    response = requests.post(
        'http://127.0.0.1:6543/api/auth/login',
        json={'email': 'test@test.com', 'password': 'test'},
        headers={
            'Origin': 'http://localhost:5173',
            'Content-Type': 'application/json'
        },
        timeout=10
    )
    print(f"Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
