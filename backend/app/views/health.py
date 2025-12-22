from pyramid.view import view_config
import sys
import os

@view_config(route_name='health_check', request_method='GET', renderer='json')
def health_check(request):
    """Health check endpoint with debug info"""
    try:
        # Check if database session maker is available
        dbmaker_available = hasattr(request.registry, 'dbmaker')
        
        # Try to get database session
        db_status = 'ok'
        db_error = None
        if dbmaker_available:
            try:
                session = request.registry.dbmaker()
                from sqlalchemy import text
                session.execute(text("SELECT 1"))
                session.close()
            except Exception as e:
                db_status = 'error'
                db_error = str(e)
        else:
            db_status = 'not_configured'
        
        return {
            'status': 'ok',
            'message': 'Backend is running',
            'database': {
                'status': db_status,
                'error': db_error,
                'dbmaker_available': dbmaker_available
            },
            'environment': {
                'database_url_present': bool(os.environ.get('DATABASE_URL')),
                'port': os.environ.get('PORT', '6543'),
            }
        }
    except Exception as e:
        import traceback
        traceback.print_exc(file=sys.stderr)
        return {
            'status': 'error',
            'message': str(e),
            'database': {'status': 'error', 'error': str(e)}
        }

@view_config(route_name='test_post', request_method='POST', renderer='json')
def test_post(request):
    """Simple test POST endpoint to debug request handling"""
    sys.stderr.write("[TEST_POST] ===== TEST POST ENDPOINT CALLED =====\n")
    sys.stderr.flush()
    
    try:
        # Try to get body
        body = request.body
        sys.stderr.write(f"[TEST_POST] Body length: {len(body) if body else 0}\n")
        sys.stderr.flush()
        
        # Try to parse as JSON
        import json
        try:
            data = json.loads(body.decode('utf-8')) if body else {}
            sys.stderr.write(f"[TEST_POST] JSON parsed: {data}\n")
            sys.stderr.flush()
        except Exception as e:
            sys.stderr.write(f"[TEST_POST] JSON parse error: {e}\n")
            sys.stderr.flush()
            data = {}
        
        return {
            'status': 'ok',
            'message': 'Test POST endpoint works',
            'received_data': data,
            'method': request.method,
            'path': request.path
        }
    except Exception as e:
        import traceback
        sys.stderr.write(f"[TEST_POST] ERROR: {type(e).__name__}: {e}\n")
        sys.stderr.flush()
        traceback.print_exc(file=sys.stderr)
        sys.stderr.flush()
        return {'error': str(e), 'type': type(e).__name__}

