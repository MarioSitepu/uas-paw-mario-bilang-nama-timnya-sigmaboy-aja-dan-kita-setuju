from pyramid.view import view_config
import sys

@view_config(route_name='health_check', request_method='GET', renderer='json')
def health_check(request):
    """Simple health check endpoint"""
    return {'status': 'ok', 'message': 'Backend is running'}

@view_config(route_name='test_post', request_method='POST', renderer='json')
def test_post(request):
    """Simple test POST endpoint to debug request handling"""
    sys.stderr.write("[TEST_POST] ===== TEST POST ENDPOINT CALLED =====\n")
    sys.stderr.flush()
    print("[TEST_POST] ===== TEST POST ENDPOINT CALLED =====", file=sys.stderr, flush=True)
    
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


@view_config(route_name='test_post', request_method='POST', renderer='json')
def test_post(request):
    """Simple test POST endpoint to debug request handling"""
    sys.stderr.write("[TEST_POST] ===== TEST POST ENDPOINT CALLED =====\n")
    sys.stderr.flush()
    print("[TEST_POST] ===== TEST POST ENDPOINT CALLED =====", file=sys.stderr, flush=True)
    
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
