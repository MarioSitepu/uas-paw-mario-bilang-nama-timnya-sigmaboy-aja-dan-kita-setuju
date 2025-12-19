#!/usr/bin/env python
"""Script to check server logs by making a request and showing what should appear in server logs"""
import requests
import sys

print("Making POST request to /api/auth/login...")
print("=" * 60)
print("CHECK YOUR SERVER TERMINAL FOR THESE LOGS:")
print("=" * 60)
print("Expected logs:")
print("  [WSGI WRAPPER] WRAPPER CALLED")
print("  [WSGI WRAPPER] POST /api/auth/login")
print("  [CORS TWEEN] Processing POST /api/auth/login")
print("  [WSGI WRAPPER] start_response called")
print("=" * 60)
print()

try:
    response = requests.post(
        'http://127.0.0.1:6543/api/auth/login',
        json={'email': 'test@test.com', 'password': 'test'},
        headers={'Origin': 'http://localhost:5173'},
        timeout=5
    )
    print(f"Response Status: {response.status_code}")
    print(f"CORS Headers Present: {'Access-Control-Allow-Origin' in response.headers}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text[:200]}")
except Exception as e:
    print(f"Request failed: {e}")
    import traceback
    traceback.print_exc()

print()
print("=" * 60)
print("NOW CHECK YOUR SERVER TERMINAL!")
print("If you don't see [WSGI WRAPPER] logs, the wrapper is not being called.")
print("If you see [WSGI WRAPPER] but no CORS headers, there's an issue with header addition.")
print("=" * 60)
