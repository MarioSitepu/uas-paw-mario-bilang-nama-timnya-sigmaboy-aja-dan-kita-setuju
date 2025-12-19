#!/usr/bin/env python
"""Test if wrapper is called for different requests"""
import requests

print("=" * 60)
print("TESTING WRAPPER CALLS")
print("=" * 60)

# Test 1: GET /health (should work)
print("\n1. Testing GET /health...")
try:
    r = requests.get('http://127.0.0.1:6543/health')
    print(f"   Status: {r.status_code}")
    print(f"   CORS: {'Access-Control-Allow-Origin' in r.headers}")
except Exception as e:
    print(f"   Error: {e}")

# Test 2: OPTIONS /api/auth/login (should work)
print("\n2. Testing OPTIONS /api/auth/login...")
try:
    r = requests.options('http://127.0.0.1:6543/api/auth/login', headers={'Origin': 'http://localhost:5173'})
    print(f"   Status: {r.status_code}")
    print(f"   CORS: {'Access-Control-Allow-Origin' in r.headers}")
except Exception as e:
    print(f"   Error: {e}")

# Test 3: POST /api/auth/login (should fail but with CORS)
print("\n3. Testing POST /api/auth/login...")
try:
    r = requests.post(
        'http://127.0.0.1:6543/api/auth/login',
        json={'email': 'test@test.com', 'password': 'test'},
        headers={'Origin': 'http://localhost:5173'}
    )
    print(f"   Status: {r.status_code}")
    print(f"   CORS: {'Access-Control-Allow-Origin' in r.headers}")
    print(f"   Body: {r.text[:100]}")
except Exception as e:
    print(f"   Error: {e}")

print("\n" + "=" * 60)
print("CHECK SERVER TERMINAL FOR [WSGI WRAPPER] LOGS!")
print("=" * 60)
