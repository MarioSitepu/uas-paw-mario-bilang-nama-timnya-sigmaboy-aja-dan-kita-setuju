from paste.deploy import loadapp
import os
import sys

# Add the parent directory to sys.path so we can import the app
# This is necessary because this file is in backend/api/ but the app package is in backend/
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from app import main

# Vercel needs a variable named 'app' (or similar, depending on configuration, 
# but usually it looks for a WSGI application object)
# We initialize the Pyramid app here.
# We pass empty settings because real settings should come from environment variables
# or be handled within the main function's logic (like DATABASE_URL handling we saw)

# Note: In a real production deployment, you might want to load configuration more robustly,
# but for Vercel + Pyramid, instantiating the WSGI app directly is the way to go.
app = main({})
