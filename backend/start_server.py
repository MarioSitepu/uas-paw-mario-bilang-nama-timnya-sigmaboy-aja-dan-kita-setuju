#!/usr/bin/env python
"""Wrapper script to start server with PORT from environment variable"""
import os
import sys

# Get PORT from environment, default to 10000 for Render
port = os.environ.get('PORT', '10000')

# Build listen address
listen = f'*:{port}'

print(f"[START_SERVER] Starting server on port {port} (from PORT env var)", file=sys.stderr, flush=True)

# Determine correct paths
script_path = os.path.abspath(__file__)
script_dir = os.path.dirname(script_path)
production_ini = os.path.join(script_dir, 'production.ini')

# Check if production.ini exists
if not os.path.exists(production_ini):
    print(f"[START_SERVER] ERROR: production.ini not found at {production_ini}", file=sys.stderr, flush=True)
    print(f"[START_SERVER] Current working directory: {os.getcwd()}", file=sys.stderr, flush=True)
    print(f"[START_SERVER] Script directory: {script_dir}", file=sys.stderr, flush=True)
    sys.exit(1)

print(f"[START_SERVER] Using config file: {production_ini}", file=sys.stderr, flush=True)

# Change to script directory (where production.ini is)
os.chdir(script_dir)

# Run pserve with listen argument
import subprocess
result = subprocess.run(
    [sys.executable, '-m', 'pyramid.scripts.pserve', 'production.ini', f'--listen={listen}'],
    cwd=script_dir
)
sys.exit(result.returncode)
