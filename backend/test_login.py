#!/usr/bin/env python
"""Test script for login endpoint"""
import requests
import json
import sys

# Test configuration
BASE_URL = "http://localhost:6543"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpassword123"

def test_health():
    """Test health check endpoint"""
    print("\n=== Testing Health Check ===")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_post_endpoint():
    """Test simple POST endpoint"""
    print("\n=== Testing Simple POST Endpoint ===")
    try:
        data = {"test": "data", "number": 123}
        response = requests.post(
            f"{BASE_URL}/api/test-post",
            json=data,
            headers={"Content-Type": "application/json", "Origin": "http://localhost:5173"},
            timeout=5
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_login():
    """Test login endpoint"""
    print("\n=== Testing Login Endpoint ===")
    try:
        data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=data,
            headers={"Content-Type": "application/json", "Origin": "http://localhost:5173"},
            timeout=5
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code in [200, 401]  # 401 is OK (invalid credentials), 200 is success
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting endpoint tests...")
    print("Make sure the backend server is running on http://localhost:6543")
    print("=" * 50)
    
    results = []
    results.append(("Health Check", test_health()))
    results.append(("Test POST", test_post_endpoint()))
    results.append(("Login", test_login()))
    
    print("\n" + "=" * 50)
    print("Test Results:")
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {name}: {status}")
    
    all_passed = all(r[1] for r in results)
    sys.exit(0 if all_passed else 1)

#!/usr/bin/env python
"""Test script for login endpoint"""
import requests
import json
import sys

# Test configuration
BASE_URL = "http://localhost:6543"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpassword123"

def test_health():
    """Test health check endpoint"""
    print("\n=== Testing Health Check ===")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_post_endpoint():
    """Test simple POST endpoint"""
    print("\n=== Testing Simple POST Endpoint ===")
    try:
        data = {"test": "data", "number": 123}
        response = requests.post(
            f"{BASE_URL}/api/test-post",
            json=data,
            headers={"Content-Type": "application/json", "Origin": "http://localhost:5173"},
            timeout=5
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_login():
    """Test login endpoint"""
    print("\n=== Testing Login Endpoint ===")
    try:
        data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=data,
            headers={"Content-Type": "application/json", "Origin": "http://localhost:5173"},
            timeout=5
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code in [200, 401]  # 401 is OK (invalid credentials), 200 is success
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting endpoint tests...")
    print("Make sure the backend server is running on http://localhost:6543")
    print("=" * 50)
    
    results = []
    results.append(("Health Check", test_health()))
    results.append(("Test POST", test_post_endpoint()))
    results.append(("Login", test_login()))
    
    print("\n" + "=" * 50)
    print("Test Results:")
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {name}: {status}")
    
    all_passed = all(r[1] for r in results)
    sys.exit(0 if all_passed else 1)

