#!/usr/bin/env python
"""Wrapper script to start server with PORT from environment variable"""
import os
import sys

# Get PORT from environment, default to 10000 for Render
port = os.environ.get('PORT', '10000')

# Build listen address
listen = f'*:{port}'

print(f"[START_SERVER] Starting server on port {port} (from PORT env var)", file=sys.stderr, flush=True)

# Import and run pserve with listen argument
# Use subprocess to properly pass arguments
import subprocess

# Change to backend directory if needed
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

# Run pserve with listen argument
result = subprocess.run(
    [sys.executable, '-m', 'pyramid.scripts.pserve', 'production.ini', f'--listen={listen}'],
    cwd=script_dir
)
sys.exit(result.returncode)
