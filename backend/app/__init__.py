from pyramid.config import Configurator
from pyramid.response import Response
from sqlalchemy import engine_from_config
from sqlalchemy.orm import sessionmaker

def main(global_config, **settings):
    """This function returns a Pyramid WSGI application."""
    config = Configurator(settings=settings)
    
    # Include routes
    config.include('.routes')
    
    # Database setup
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession = sessionmaker(bind=engine)
    config.registry.dbmaker = DBSession
    
    # Scan for decorators
    config.scan()
    
    return config.make_wsgi_app()