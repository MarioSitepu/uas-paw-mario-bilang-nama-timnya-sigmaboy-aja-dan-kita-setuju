from pyramid.view import view_config

@view_config(route_name='health_check', request_method='GET', renderer='json')
def health_check(request):
    """Simple health check endpoint"""
    return {'status': 'ok', 'message': 'Backend is running'}
