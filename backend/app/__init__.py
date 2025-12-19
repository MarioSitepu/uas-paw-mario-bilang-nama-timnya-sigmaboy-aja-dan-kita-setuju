import os
from pathlib import Path
from pyramid.config import Configurator
from pyramid.response import Response
from pyramid import tweens
import pyramid.tweens
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
    """CORS tween to add CORS headers to all responses - runs early in the pipeline"""
    def cors_tween(request):
        import sys
        # Get origin from request
        origin = request.headers.get('Origin', '')
        
        # Force flush immediately to ensure log appears
        sys.stderr.write(f"[CORS TWEEN] Processing {request.method} {request.path}\n")
        sys.stderr.flush()
        
        # Handle preflight OPTIONS requests immediately
        if request.method == 'OPTIONS':
            response = Response()
            response.status_int = 200
            response.headers['Content-Length'] = '0'
        else:
            # Process the actual request
            response = None
            try:
                response = handler(request)
                print(f"[CORS TWEEN] Handler returned successfully", file=sys.stderr, flush=True)
            except BaseException as e:
                # Even on exceptions, we need CORS headers
                # Catch BaseException to catch ALL exceptions including SystemExit, KeyboardInterrupt
                import traceback
                print(f"[CORS TWEEN] CAUGHT EXCEPTION: {type(e).__name__}: {e}", file=sys.stderr, flush=True)
                traceback.print_exc(file=sys.stderr)
                try:
                    response = Response(
                        json_body={'error': str(e), 'type': type(e).__name__},
                        status=500,
                        content_type='application/json'
                    )
                except Exception as resp_error:
                    # If creating response fails, create a minimal response
                    print(f"[CORS TWEEN] Failed to create error response: {resp_error}", file=sys.stderr, flush=True)
                    response = Response(
                        body=f'{{"error": "Internal server error", "type": "{type(e).__name__}"}}'.encode('utf-8'),
                        status=500,
                        content_type='application/json'
                    )
        
        # Ensure response object exists and has headers
        if response is None:
            response = Response(status=500, json_body={'error': 'No response generated'})
        
        # Ensure response has headers attribute
        if not hasattr(response, 'headers'):
            # If response doesn't have headers, wrap it
            new_response = Response(
                body=response.body if hasattr(response, 'body') else str(response),
                status=getattr(response, 'status_code', 500),
                content_type=getattr(response, 'content_type', 'application/json')
            )
            response = new_response
        
        # Add CORS headers to ALL responses - use try/except to ensure it always works
        try:
            # Get allowed origins from environment or use defaults
            cors_origins_env = os.environ.get('CORS_ORIGINS', '')
            if cors_origins_env:
                allowed_origins = [origin.strip() for origin in cors_origins_env.split(',')]
            else:
                # Default origins for development
                allowed_origins = [
                    'http://localhost:5173',
                    'http://localhost:5174',
                    'http://127.0.0.1:5173',
                    'http://127.0.0.1:5174',
                ]
            
            # If origin is in allowed list, use it; otherwise use * (but can't use credentials with *)
            if origin and origin in allowed_origins:
                response.headers['Access-Control-Allow-Origin'] = origin
                response.headers['Access-Control-Allow-Credentials'] = 'true'
            else:
                # Fallback to * for development (but no credentials)
                response.headers['Access-Control-Allow-Origin'] = '*'
            
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept'
            response.headers['Access-Control-Max-Age'] = '86400'
        except Exception as cors_error:
            # If adding headers fails, log but don't crash
            import sys
            print(f"WARNING: Failed to add CORS headers: {cors_error}", file=sys.stderr)
            # Try to add at least the basic header
            try:
                response.headers['Access-Control-Allow-Origin'] = '*'
            except:
                pass
        
        return response
    
    return cors_tween

def main(global_config, **settings):
    """This function returns a Pyramid WSGI application."""
    # Handle PORT from environment for production
    # Waitress reads PORT from environment automatically, but we can also set it here
    port = os.environ.get('PORT')
    if port:
        # Update listen setting if PORT is provided
        settings.setdefault('listen', f'*:{port}')
    
    config = Configurator(settings=settings)
    
    # Add CORS tween - must be added EARLY
    # This ensures CORS headers are added to all responses, including errors
    # Position it to run at INGRESS (very early) so it wraps everything
    config.add_tween('app.cors_tween_factory', under=tweens.INGRESS)
    
    # Include routes
    config.include('.routes')
    
    # Database setup - support environment variable for Neon
    # Priority: DATABASE_URL env var > sqlalchemy.url in config
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        # Strip quotes if present (Render sometimes adds quotes)
        database_url = database_url.strip('"\'')
        # Log for debugging (first 50 chars only for security)
        import sys
        print(f"[MAIN] DATABASE_URL from env: {database_url[:50]}...", file=sys.stderr, flush=True)
        # Use DATABASE_URL from environment if available (Neon connection string)
        # Convert postgresql:// to postgresql+psycopg:// for psycopg3
        if database_url.startswith('postgresql://') and not database_url.startswith('postgresql+psycopg://'):
            database_url = database_url.replace('postgresql://', 'postgresql+psycopg://', 1)
        
        # Force IPv4 for Supabase connections to avoid IPv6 issues
        # Add connect_timeout and prefer IPv4
        if 'supabase.co' in database_url:
            # Add connection parameters if not present
            if '?' in database_url:
                if 'connect_timeout' not in database_url:
                    database_url += '&connect_timeout=10'
            else:
                database_url += '?connect_timeout=10'
            # Ensure sslmode is set
            if 'sslmode' not in database_url:
                database_url += '&sslmode=require' if '?' in database_url else '?sslmode=require'
        
        settings['sqlalchemy.url'] = database_url
    elif 'sqlalchemy.url' in settings:
        # Check if it's a placeholder, if so, warn user
        url = settings.get('sqlalchemy.url', '')
        if 'placeholder' in url or 'user:password@host/database' in url:
            import warnings
            warnings.warn(
                "Please set DATABASE_URL environment variable or update sqlalchemy.url in development.ini "
                "with your Neon PostgreSQL connection string"
            )
        # Convert postgresql:// to postgresql+psycopg:// for psycopg3
        elif url.startswith('postgresql://') and not url.startswith('postgresql+psycopg://'):
            settings['sqlalchemy.url'] = url.replace('postgresql://', 'postgresql+psycopg://', 1)
    
    # Session secret - read from environment variable
    session_secret = os.environ.get('SESSION_SECRET')
    if session_secret:
        settings['session.secret'] = session_secret
    elif 'session.secret' in settings:
        # Check if it's a placeholder
        secret = settings.get('session.secret', '')
        if 'placeholder' in secret:
            import warnings
            warnings.warn(
                "Please set SESSION_SECRET environment variable for production"
            )
    
    # Add pool_pre_ping to handle disconnected connections (SSL timeout)
    settings['sqlalchemy.pool_pre_ping'] = 'true'
    # Add connection pool settings for better reliability
    settings['sqlalchemy.pool_size'] = '5'
    settings['sqlalchemy.max_overflow'] = '10'
    settings['sqlalchemy.pool_recycle'] = '3600'
    try:
        engine = engine_from_config(settings, 'sqlalchemy.')
        DBSession = sessionmaker(bind=engine)
        config.registry.dbmaker = DBSession
    except Exception as db_error:
        import sys
        print(f"[MAIN] Database connection error: {db_error}", file=sys.stderr, flush=True)
        import traceback
        traceback.print_exc(file=sys.stderr)
        # Create a dummy session maker that will fail gracefully
        def dummy_session_maker():
            raise Exception(f"Database connection failed: {db_error}")
        config.registry.dbmaker = dummy_session_maker
    
    # Add exception view to handle all exceptions with CORS headers
    from pyramid.httpexceptions import HTTPException
    
    def exception_view(exc, request):
        """Handle all exceptions and ensure CORS headers are added"""
        import sys
        import traceback
        print(f"[EXCEPTION VIEW] Handling exception: {type(exc).__name__}: {exc}", file=sys.stderr, flush=True)
        traceback.print_exc(file=sys.stderr)
        response = Response(
            json_body={'error': str(exc), 'type': type(exc).__name__},
            status=getattr(exc, 'status_code', 500) if hasattr(exc, 'status_code') else 500,
            content_type='application/json'
        )
        # CORS headers will be added by the tween
        return response
    
    config.add_view(exception_view, context=Exception)
    
    # Scan for decorators
    config.scan()
    
    app = config.make_wsgi_app()
    
    # Wrap the WSGI app to add CORS headers to ALL responses, including Waitress error pages
    import sys
    print(f"[MAIN] Creating WSGI wrapper - this should appear when server starts", file=sys.stderr, flush=True)
    
    def cors_wsgi_wrapper(environ, start_response):
        """WSGI wrapper to add CORS headers to all responses"""
        import sys
        import traceback
        
        # CRITICAL: Log that wrapper is being called - THIS MUST APPEAR FOR ALL REQUESTS
        # Force flush immediately to ensure log appears - use multiple methods
        # Write directly to stderr to ensure it appears even if print fails
        # Use multiple write attempts to ensure it appears
        try:
            sys.stderr.write("[WSGI WRAPPER] ===== WRAPPER CALLED ===== REQUEST START\n")
            sys.stderr.flush()
        except:
            pass
        try:
            print("[WSGI WRAPPER] ===== WRAPPER CALLED ===== REQUEST START", file=sys.stderr, flush=True)
        except:
            pass
        try:
            import os
            os.write(2, b"[WSGI WRAPPER] ===== WRAPPER CALLED ===== REQUEST START\n")
        except:
            pass
        
        # Get origin - try multiple ways
        origin = environ.get('HTTP_ORIGIN', '')
        if not origin and environ.get('HTTP_REFERER'):
            try:
                from urllib.parse import urlparse
                referer = environ.get('HTTP_REFERER', '')
                parsed = urlparse(referer)
                origin = f"{parsed.scheme}://{parsed.netloc}"
            except:
                pass
        
        method = environ.get('REQUEST_METHOD', 'UNKNOWN')
        path = environ.get('PATH_INFO', 'UNKNOWN')
        
        # Log incoming request for debugging - THIS MUST APPEAR
        # Force flush immediately to ensure log appears
        try:
            sys.stderr.write(f"[WSGI WRAPPER] ===== {method} {path} from origin: {origin} =====\n")
            sys.stderr.flush()
            sys.stderr.write(f"[WSGI WRAPPER] Content-Type: {environ.get('CONTENT_TYPE', 'NONE')}\n")
            sys.stderr.flush()
            sys.stderr.write(f"[WSGI WRAPPER] Content-Length: {environ.get('CONTENT_LENGTH', 'NONE')}\n")
            sys.stderr.flush()
        except:
            pass  # Even if logging fails, continue
        
        # Track if start_response has been called
        response_started = [False]
        original_headers = []
        
        def custom_start_response(status, response_headers, exc_info=None):
            # Mark that response has started
            response_started[0] = True
            
            # Log that start_response was called
            print(f"[WSGI WRAPPER] start_response called with status: {status}", file=sys.stderr, flush=True)
            
            # Convert headers to list if needed
            if not isinstance(response_headers, list):
                response_headers = list(response_headers)
            
            # Store original headers
            original_headers[:] = response_headers[:]
            
            # Add CORS headers - ALWAYS add them, even to error responses
            # Get allowed origins from environment or use defaults
            cors_origins_env = os.environ.get('CORS_ORIGINS', '')
            if cors_origins_env:
                allowed_origins = [origin.strip() for origin in cors_origins_env.split(',')]
            else:
                # Default origins for development
                allowed_origins = [
                    'http://localhost:5173',
                    'http://localhost:5174',
                    'http://127.0.0.1:5173',
                    'http://127.0.0.1:5174',
                ]
            
            # Check if CORS headers already exist
            has_cors = any(h[0].lower() == 'access-control-allow-origin' for h in response_headers)
            
            if not has_cors:
                print(f"[WSGI WRAPPER] Adding CORS headers to response", file=sys.stderr, flush=True)
                if origin and origin in allowed_origins:
                    response_headers.append(('Access-Control-Allow-Origin', origin))
                    response_headers.append(('Access-Control-Allow-Credentials', 'true'))
                else:
                    response_headers.append(('Access-Control-Allow-Origin', '*'))
                
                response_headers.append(('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH'))
                response_headers.append(('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept'))
                response_headers.append(('Access-Control-Max-Age', '86400'))
            else:
                print(f"[WSGI WRAPPER] CORS headers already present", file=sys.stderr, flush=True)
            
            return start_response(status, response_headers, exc_info)
        
        # CRITICAL: Wrap the entire app call to catch ALL exceptions
        # This MUST catch everything, including errors during request parsing
        try:
            sys.stderr.write(f"[WSGI WRAPPER] About to call app(environ, custom_start_response)\n")
            sys.stderr.flush()
        except:
            pass
        
        # CRITICAL: Call app and catch ALL exceptions
        # This MUST catch everything, including errors during request parsing
        try:
            result = app(environ, custom_start_response)
            try:
                sys.stderr.write(f"[WSGI WRAPPER] Request processed successfully\n")
                sys.stderr.flush()
            except:
                pass
            return result
        except (KeyboardInterrupt, SystemExit):
            # Don't catch these - let them propagate
            raise
        except Exception as e:
            # Catch ALL exceptions (but not KeyboardInterrupt/SystemExit which we re-raise above)
            import traceback
            sys.stderr.write(f"[WSGI WRAPPER] ===== CAUGHT EXCEPTION ===== {type(e).__name__}: {e}\n")
            sys.stderr.flush()
            traceback.print_exc(file=sys.stderr)
            sys.stderr.flush()
            
            # Only call start_response if it hasn't been called yet
            if not response_started[0]:
                print(f"[WSGI WRAPPER] Generating error response with CORS headers", file=sys.stderr, flush=True)
                status = '500 Internal Server Error'
                headers = [('Content-Type', 'application/json')]
                
                # Get allowed origins from environment or use defaults
                cors_origins_env = os.environ.get('CORS_ORIGINS', '')
                if cors_origins_env:
                    allowed_origins = [origin.strip() for origin in cors_origins_env.split(',')]
                else:
                    # Default origins for development
                    allowed_origins = [
                        'http://localhost:5173',
                        'http://localhost:5174',
                        'http://127.0.0.1:5173',
                        'http://127.0.0.1:5174',
                    ]
                if origin and origin in allowed_origins:
                    headers.append(('Access-Control-Allow-Origin', origin))
                    headers.append(('Access-Control-Allow-Credentials', 'true'))
                else:
                    headers.append(('Access-Control-Allow-Origin', '*'))
                
                headers.append(('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH'))
                headers.append(('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept'))
                
                # Escape JSON properly
                error_msg = str(e).replace('"', '\\"').replace('\n', '\\n').replace('\r', '')
                body = f'{{"error": "{error_msg}", "type": "{type(e).__name__}"}}'.encode('utf-8')
                try:
                    start_response(status, headers)
                    return [body]
                except Exception as start_error:
                    # If start_response fails, log and return minimal response
                    print(f"[WSGI WRAPPER] Failed to call start_response: {start_error}", file=sys.stderr, flush=True)
                    # Try to call original start_response
                    try:
                        start_response(status, headers)
                        return [body]
                    except:
                        # Last resort - return error without CORS (shouldn't happen)
                        return [b'{"error":"Internal server error"}']
            else:
                # If start_response was already called, we can't add CORS headers
                # But we should log this
                print(f"[WSGI WRAPPER] WARNING: start_response already called, cannot add CORS headers to error", file=sys.stderr, flush=True)
                # Re-raise to let Waitress handle it (but it won't have CORS)
                raise
    
    # Verify wrapper is being returned
    import sys
    print(f"[MAIN] Returning cors_wsgi_wrapper function - wrapper should be called for ALL requests", file=sys.stderr, flush=True)
    print(f"[MAIN] Wrapper function: {cors_wsgi_wrapper}", file=sys.stderr, flush=True)
    return cors_wsgi_wrapper