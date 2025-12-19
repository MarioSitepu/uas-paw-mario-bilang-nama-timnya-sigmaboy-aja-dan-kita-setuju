#!/usr/bin/env python
"""Simple script to test if the server is running and responding with CORS headers"""
import requests
import sys

def test_server():
    base_url = "http://127.0.0.1:6543"
    
    print("Testing server at", base_url)
    print("-" * 50)
    
    # Test 1: Health check
    try:
        print("\n1. Testing /health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   CORS Headers: {dict(response.headers)}")
        if 'Access-Control-Allow-Origin' in response.headers:
            print("   [OK] CORS headers present!")
        else:
            print("   [FAIL] CORS headers missing!")
    except requests.exceptions.ConnectionError:
        print("   ❌ Server is not running!")
        print("   Please start the server with: python -m pyramid.scripts.pserve development.ini")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test 2: OPTIONS preflight
    try:
        print("\n2. Testing OPTIONS preflight...")
        response = requests.options(
            f"{base_url}/api/auth/login",
            headers={"Origin": "http://localhost:5173"},
            timeout=5
        )
        print(f"   Status: {response.status_code}")
        print(f"   CORS Headers: {dict(response.headers)}")
        if 'Access-Control-Allow-Origin' in response.headers:
            print("   [OK] CORS headers present!")
        else:
            print("   [FAIL] CORS headers missing!")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: POST request
    try:
        print("\n3. Testing POST request...")
        response = requests.post(
            f"{base_url}/api/auth/login",
            json={"email": "test@test.com", "password": "test"},
            headers={
                "Origin": "http://localhost:5173",
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout=5
        )
        print(f"   Status: {response.status_code}")
        print(f"   CORS Headers: {dict(response.headers)}")
        if 'Access-Control-Allow-Origin' in response.headers:
            print("   [OK] CORS headers present!")
        else:
            print("   [FAIL] CORS headers missing!")
        print(f"   Response: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "-" * 50)
    print("Test complete!")
    return True

if __name__ == "__main__":
    test_server()
