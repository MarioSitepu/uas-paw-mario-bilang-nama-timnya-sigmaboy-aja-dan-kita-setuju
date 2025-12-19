#!/usr/bin/env python
"""Generate a secure random secret key for session"""
import secrets

# Generate a 64-character random secret
secret = secrets.token_urlsafe(48)
print(f"Generated SESSION_SECRET:")
print(secret)
print(f"\nAdd this to your .env file or environment variables:")
print(f"SESSION_SECRET={secret}")
