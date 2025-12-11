from pyramid.config import Configurator

def includeme(config):
    """Configure routes for the application"""
    # API routes
    config.add_route('home', '/')
    config.add_route('api_users', '/api/users')
    config.add_route('api_user', '/api/users/{id}')
    
    # Add CORS support
    config.add_cors_preflight_handler()