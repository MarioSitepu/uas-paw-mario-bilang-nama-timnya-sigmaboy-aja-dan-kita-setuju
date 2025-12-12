from pyramid.config import Configurator

def includeme(config):
    """Configure routes for the application"""
    # API routes
    config.add_route('home', '/')
    config.add_route('api_users', '/api/users')
    config.add_route('api_user', '/api/users/{id}')
    
    # CORS is handled via tween in __init__.py