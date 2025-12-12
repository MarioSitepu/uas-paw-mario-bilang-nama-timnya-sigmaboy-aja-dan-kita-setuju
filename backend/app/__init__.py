from pyramid.config import Configurator
from pyramid.response import Response
from sqlalchemy import engine_from_config
from sqlalchemy.orm import sessionmaker

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
    
    # Database setup
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession = sessionmaker(bind=engine)
    config.registry.dbmaker = DBSession
    
    # Scan for decorators
    config.scan()
    
    return config.make_wsgi_app()