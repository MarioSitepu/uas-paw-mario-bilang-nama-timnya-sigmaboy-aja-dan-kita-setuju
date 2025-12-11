from pyramid.view import view_config
from pyramid.response import Response
import json

@view_config(route_name='home', request_method='GET', renderer='json')
def home(request):
    return {'message': 'Welcome to Pyramid API Backend'}

@view_config(route_name='api_users', request_method='GET', renderer='json')
def get_users(request):
    # TODO: Implement database query
    return {'users': []}

@view_config(route_name='api_users', request_method='POST', renderer='json')
def create_user(request):
    # TODO: Implement user creation
    return {'message': 'User created successfully'}

@view_config(route_name='api_user', request_method='GET', renderer='json')
def get_user(request):
    user_id = request.matchdict['id']
    # TODO: Implement single user query
    return {'user_id': user_id}