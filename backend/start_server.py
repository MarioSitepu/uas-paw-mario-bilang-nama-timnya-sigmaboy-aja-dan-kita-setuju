#!/usr/bin/env python
"""Wrapper script to start server with PORT from environment variable"""
import os
import sys

# Get PORT from environment, default to 10000 for Render
port = os.environ.get('PORT', '10000')

# Build listen address
listen = f'*:{port}'

print(f"[START_SERVER] Starting server on port {port}", file=sys.stderr, flush=True)

# Import and run pserve with listen argument
from pyramid.scripts.pserve import main as pserve_main

# Override sys.argv to pass listen argument
original_argv = sys.argv[:]
sys.argv = ['pserve', 'production.ini', f'--listen={listen}']

try:
    pserve_main()
finally:
    sys.argv = original_argv
