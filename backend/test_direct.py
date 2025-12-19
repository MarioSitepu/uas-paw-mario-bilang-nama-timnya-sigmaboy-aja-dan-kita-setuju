#!/usr/bin/env python
"""Direct test to see what error occurs"""
import requests
import json

print("=" * 60)
print("TESTING POST /api/auth/login")
print("=" * 60)

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
    print(f"\nStatus Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"CORS Present: {'Access-Control-Allow-Origin' in response.headers}")
    print(f"Response Body: {response.text}")
except requests.exceptions.RequestException as e:
    print(f"\nRequest Exception: {e}")
    import traceback
    traceback.print_exc()
except Exception as e:
    print(f"\nUnexpected Exception: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("CHECK SERVER TERMINAL FOR LOGS!")
print("=" * 60)
