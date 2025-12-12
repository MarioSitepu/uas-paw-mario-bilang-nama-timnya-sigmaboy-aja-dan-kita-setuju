import os
from pathlib import Path
from pyramid.config import Configurator
from pyramid.response import Response
from sqlalchemy import engine_from_config
from sqlalchemy.orm import sessionmaker

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    # Load .env file from backend directory
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    # python-dotenv not installed, skip
    pass

def cors_tween_factory(handler, registry):
    """CORS tween to add CORS headers to all responses"""
    def cors_tween(request):
        response = handler(request)
        
        # Handle preflight requests
        if request.method == 'OPTIONS':
            response = Response()
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Max-Age'] = '3600'
            return response
        
        # Add CORS headers to all responses
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        
        return response
    return cors_tween

def main(global_config, **settings):
    """This function returns a Pyramid WSGI application."""
    config = Configurator(settings=settings)
    
    # Add CORS tween
    config.add_tween('app.cors_tween_factory')
    
    # Include routes
    config.include('.routes')
    
    # Database setup - support environment variable for Neon
    # Priority: DATABASE_URL env var > sqlalchemy.url in config
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        # Use DATABASE_URL from environment if available (Neon connection string)
        # Convert postgresql:// to postgresql+psycopg:// for psycopg3
        if database_url.startswith('postgresql://') and not database_url.startswith('postgresql+psycopg://'):
            database_url = database_url.replace('postgresql://', 'postgresql+psycopg://', 1)
        settings['sqlalchemy.url'] = database_url
    elif 'sqlalchemy.url' in settings:
        # Check if it's a placeholder, if so, warn user
        url = settings.get('sqlalchemy.url', '')
        if 'user:password@host/database' in url:
            import warnings
            warnings.warn(
                "Please set DATABASE_URL environment variable or update sqlalchemy.url in development.ini "
                "with your Neon PostgreSQL connection string"
            )
        # Convert postgresql:// to postgresql+psycopg:// for psycopg3
        elif url.startswith('postgresql://') and not url.startswith('postgresql+psycopg://'):
            settings['sqlalchemy.url'] = url.replace('postgresql://', 'postgresql+psycopg://', 1)
    
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession = sessionmaker(bind=engine)
    config.registry.dbmaker = DBSession
    
    # Scan for decorators
    config.scan()
    
    return config.make_wsgi_app()