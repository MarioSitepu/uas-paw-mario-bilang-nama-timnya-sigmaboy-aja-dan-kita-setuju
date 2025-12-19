#!/usr/bin/env python
"""Wrapper script to start server with PORT from environment variable"""
import os
import sys
import configparser
import tempfile
import shutil

# Get PORT from environment, default to 10000 for Render
port = os.environ.get('PORT', '10000')

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

# Read production.ini and modify listen setting
config = configparser.ConfigParser()
config.read(production_ini)

# Update listen in [server:main] section
if 'server:main' in config:
    config['server:main']['listen'] = f'*:{port}'
    print(f"[START_SERVER] Updated listen to *:{port}", file=sys.stderr, flush=True)
else:
    print(f"[START_SERVER] WARNING: [server:main] section not found", file=sys.stderr, flush=True)

# Write modified config to temporary file
temp_ini = os.path.join(script_dir, 'production_temp.ini')
with open(temp_ini, 'w') as f:
    config.write(f)

# Change to script directory
os.chdir(script_dir)

# Run pserve with temporary config file
import subprocess
try:
    result = subprocess.run(
        [sys.executable, '-m', 'pyramid.scripts.pserve', 'production_temp.ini'],
        cwd=script_dir
    )
    sys.exit(result.returncode)
finally:
    # Clean up temporary file
    if os.path.exists(temp_ini):
        os.remove(temp_ini)
