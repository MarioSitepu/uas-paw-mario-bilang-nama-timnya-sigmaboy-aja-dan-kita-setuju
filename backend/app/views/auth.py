from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPBadRequest, HTTPNotFound, HTTPUnauthorized, HTTPForbidden
from ..models import User, Doctor, Token
import json
import secrets
import datetime
import base64
import traceback
import sys
import time
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

def get_db_session(request, retries=3):
    """Get database session from request with retry logic"""
    import time
    import sys
    
    for attempt in range(retries):
        try:
            return request.registry.dbmaker()
        except Exception as e:
            error_type = type(e).__name__
            error_msg = str(e)
            
            # Check if it's a connection error that might be retryable
            is_retryable = (
                'ConnectionTimeout' in error_type or
                'OperationalError' in error_type or
                'connection timeout' in error_msg.lower() or
                'connection refused' in error_msg.lower()
            )
            
            if attempt < retries - 1 and is_retryable:
                wait_time = (attempt + 1) * 2  # Exponential backoff: 2s, 4s, 6s
                print(f"[get_db_session] Attempt {attempt + 1}/{retries} failed: {error_type}. Retrying in {wait_time}s...", file=sys.stderr, flush=True)
                time.sleep(wait_time)
                continue
            else:
                print(f"[get_db_session] Error creating session after {attempt + 1} attempts: {error_type}: {error_msg}", file=sys.stderr, flush=True)
                import traceback
                traceback.print_exc(file=sys.stderr)
                raise

def generate_token(request, user_id: int, session=None) -> str:
    """Generate authentication token - stored in database"""
    # Use provided session if available, otherwise create new one
    if session is None:
        session = get_db_session(request)
        should_close = True
    else:
        should_close = False
    
    try:
        token_string = secrets.token_urlsafe(32)
        expires_at = datetime.datetime.now() + datetime.timedelta(hours=24)
        
        token = Token(
            token=token_string,
            user_id=user_id,
            expires_at=expires_at
        )
        session.add(token)
        session.commit()
        return token_string
    except Exception as e:
        session.rollback()
        raise e
    finally:
        if should_close:
            session.close()

def validate_token(request) -> dict:
    """Validate token from Authorization header - check database"""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    
    token_string = auth_header.replace('Bearer ', '')
    session = get_db_session(request)
    try:
        token = session.query(Token).filter(Token.token == token_string).first()
        
        if not token:
            return None
        
        # Check if expired
        if token.is_expired():
            session.delete(token)
            session.commit()
            return None
        
        return {
            'user_id': token.user_id,
            'token_id': token.id
        }
    finally:
        session.close()

def get_current_user(request):
    """Get current authenticated user"""
    token_data = validate_token(request)
    if not token_data:
        return None
    
    session = get_db_session(request)
    try:
        user = session.query(User).filter(User.id == token_data['user_id']).first()
        if user:
            # Force load of attributes before session closes
            user.role
            user.id
            user.name
            user.email
        return user
    finally:
        session.close()

def require_auth(request):
    """Require authentication - returns user or raises error"""
    user = get_current_user(request)
    if not user:
        # Instead of returning None, we can raise an exception that the tween or exception view will catch
        # or return a Response object that Pyramid can handle
        from pyramid.httpexceptions import HTTPUnauthorized
        raise HTTPUnauthorized(json.dumps({'error': 'Authentication required'}), content_type='application/json')
    return user

def require_role(request, roles):
    """Require specific role(s) - roles can be string or list"""
    user = require_auth(request)
    if isinstance(roles, str):
        roles = [roles]
    if user.role not in roles:
        raise HTTPForbidden(
            json_body={'error': f'Access denied. Required role: {", ".join(roles)}'},
            content_type='application/json'
        )
    return user


# ==================== AUTH ENDPOINTS ====================

@view_config(route_name='auth_register', request_method='POST', renderer='json')
def register(request):
    """Register new user (Patient or Doctor)"""
    session = get_db_session(request)
    try:
        data = request.json_body
        
        # Validation
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return {'error': f'{field} is required'}, 400
        
        # Check email uniqueness
        existing = session.query(User).filter(User.email == data['email']).first()
        if existing:
            return {'error': 'Email already registered'}
        
        # Create user
        user = User(
            name=data['name'],
            email=data['email'],
            role=data.get('role', 'patient')
        )
        user.set_password(data['password'])
        
        session.add(user)
        session.flush()  # Get the user ID
        
        # If registering as doctor, create doctor profile
        if data.get('role') == 'doctor':
            from ..models import Doctor
            doctor = Doctor(
                user_id=user.id,
                specialization=data.get('specialization', 'General'),
                license_number=data.get('license_number'),
                phone=data.get('phone'),
                bio=data.get('bio'),
                schedule=data.get('schedule', {})
            )
            session.add(doctor)
        
        session.commit()
        
        # Generate token - use existing session
        token = generate_token(request, user.id, session=session)
        
        return {
            'message': 'Registration successful',
            'token': token,
            'user': user.to_dict()
        }
    except Exception as e:
        session.rollback()
        return {'error': str(e)}
    finally:
        session.close()


@view_config(route_name='auth_login', request_method='POST', renderer='json')
def login(request):
    """Login user"""
    import sys
    import os
    import traceback
    
    # ULTRA-AGGRESSIVE LOGGING: Log immediately with multiple methods
    log_msg = "[LOGIN] ===== LOGIN ENDPOINT CALLED =====\n"
    for i in range(10):
        try:
            sys.stderr.write(log_msg)
            sys.stderr.flush()
        except:
            pass
        try:
            print(log_msg.strip(), file=sys.stderr, flush=True)
        except:
            pass
        try:
            os.write(2, log_msg.encode())
            os.fsync(2)
        except:
            pass
    
    session = None
    try:
        # Log that we're getting session
        sys.stderr.write("[LOGIN] Getting database session...\n")
        sys.stderr.flush()
        session = get_db_session(request)
        sys.stderr.write("[LOGIN] Database session obtained\n")
        sys.stderr.flush()
        
        # Safely get JSON body - catch ALL possible exceptions
        data = None
        try:
            sys.stderr.write("[LOGIN] Attempting to read request body...\n")
            sys.stderr.flush()
            
            # Check if request has body attribute
            if not hasattr(request, 'body'):
                sys.stderr.write("[LOGIN] ERROR: request has no 'body' attribute\n")
                sys.stderr.flush()
                request.response.status_code = 400
                return {'error': 'Request object missing body attribute'}
            
            # Try to get body first, then parse as JSON
            body = request.body
            sys.stderr.write(f"[LOGIN] Request body type: {type(body)}, length: {len(body) if body else 0}\n")
            sys.stderr.flush()
            
            if not body:
                sys.stderr.write("[LOGIN] ERROR: Request body is empty\n")
                sys.stderr.flush()
                request.response.status_code = 400
                return {'error': 'Request body is required'}
            
            # Parse JSON manually to avoid Pyramid's json_body issues
            import json
            try:
                sys.stderr.write("[LOGIN] Attempting to decode JSON...\n")
                sys.stderr.flush()
                body_str = body.decode('utf-8') if isinstance(body, bytes) else str(body)
                sys.stderr.write(f"[LOGIN] Body string (first 100 chars): {body_str[:100]}\n")
                sys.stderr.flush()
                data = json.loads(body_str)
                sys.stderr.write(f"[LOGIN] JSON decoded successfully: {type(data)}\n")
                sys.stderr.flush()
            except (UnicodeDecodeError, json.JSONDecodeError) as e:
                sys.stderr.write(f"[LOGIN] JSON decode error: {type(e).__name__}: {e}\n")
                sys.stderr.flush()
                traceback.print_exc(file=sys.stderr)
                sys.stderr.flush()
                request.response.status_code = 400
                return {'error': f'Invalid JSON: {str(e)}'}
            
            if not isinstance(data, dict):
                sys.stderr.write(f"[LOGIN] Data is not a dict: {type(data)}\n")
                sys.stderr.flush()
                request.response.status_code = 400
                return {'error': 'Request body must be JSON object'}
        except AttributeError as e:
            sys.stderr.write(f"[LOGIN] AttributeError accessing request body: {type(e).__name__}: {e}\n")
            sys.stderr.flush()
            traceback.print_exc(file=sys.stderr)
            sys.stderr.flush()
            request.response.status_code = 400
            return {'error': f'Request parsing error: {str(e)}'}
        except Exception as e:
            # Catch any other exception when accessing request body
            sys.stderr.write(f"[LOGIN] Error accessing request body: {type(e).__name__}: {e}\n")
            sys.stderr.flush()
            traceback.print_exc(file=sys.stderr)
            sys.stderr.flush()
            request.response.status_code = 400
            return {'error': f'Error parsing request: {str(e)}'}
        
        if not data:
            request.response.status_code = 400
            return {'error': 'Request body is required'}
        
        email = data.get('email') if isinstance(data, dict) else None
        password = data.get('password') if isinstance(data, dict) else None
        role_raw = data.get('role') if isinstance(data, dict) else None  # Get role from request
        
        sys.stderr.write(f"[LOGIN] Email: {email}, Password provided: {bool(password)}, Role: {role_raw}\n")
        sys.stderr.flush()
        
        if not email or not password:
            request.response.status_code = 400
            return {'error': 'Email and password are required'}
        
        user = session.query(User).filter(User.email == email).first()
        
        # Debug
        sys.stderr.write(f"[LOGIN] DEBUG: email={email}, user found={user is not None}\n")
        sys.stderr.flush()
        if user:
            result = user.check_password(password)
            sys.stderr.write(f"[LOGIN] DEBUG: check_password result={result}\n")
            sys.stderr.flush()
        
        if not user or not user.check_password(password):
            request.response.status_code = 401
            return {'error': 'Email atau password salah'}
        
        # Check role mismatch if role is provided in request
        if role_raw:
            requested_role = role_raw.upper() if role_raw else None
            user_role_upper = user.role.upper() if user.role else 'PATIENT'
            
            sys.stderr.write(f"[LOGIN] Role check: requested={requested_role}, user_role={user_role_upper}\n")
            sys.stderr.flush()
            
            if requested_role and requested_role != user_role_upper:
                request.response.status_code = 403
                if user_role_upper == 'PATIENT':
                    return {'error': 'Akses ditolak: Akun ini terdaftar sebagai PASIEN. Silakan login melalui halaman login pasien atau gunakan akun yang sesuai.'}
                elif user_role_upper == 'DOCTOR':
                    return {'error': 'Akses ditolak: Akun ini terdaftar sebagai DOKTER. Silakan login melalui halaman login dokter atau gunakan akun yang sesuai.'}
                elif user_role_upper == 'ADMIN':
                    return {'error': 'Akses ditolak: Akun ini terdaftar sebagai ADMIN. Silakan login melalui halaman login admin atau gunakan akun yang sesuai.'}
                else:
                    return {'error': f'Akses ditolak: Role akun Anda ({user_role_upper}) tidak sesuai dengan halaman login ini ({requested_role}).'}
        
        # Fix legacy lowercase roles
        if user.role and user.role != user.role.upper():
            sys.stderr.write(f"[LOGIN] Upgrading role to uppercase: {user.role} -> {user.role.upper()}\n")
            sys.stderr.flush()
            user.role = user.role.upper()
            session.commit()
        
        # Ensure Doctor profile exists if role is DOCTOR
        if user.role == 'DOCTOR':
            from ..models import Doctor
            doctor = session.query(Doctor).filter(Doctor.user_id == user.id).first()
            if not doctor:
                sys.stderr.write(f'[LOGIN] Creating missing Doctor profile for user {user.id}\n')
                sys.stderr.flush()
                doctor = Doctor(
                    user_id=user.id,
                    specialization='General Practitioner',
                    schedule={}
                )
                session.add(doctor)
                session.commit()

        # Generate token - use existing session
        sys.stderr.write("[LOGIN] Generating token...\n")
        sys.stderr.flush()
        token = generate_token(request, user.id, session=session)
        sys.stderr.write("[LOGIN] Token generated successfully\n")
        sys.stderr.flush()
        
        sys.stderr.write("[LOGIN] ===== LOGIN SUCCESS =====\n")
        sys.stderr.flush()
        
        return {
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }
    except Exception as e:
        sys.stderr.write(f"[LOGIN] UNHANDLED EXCEPTION: {type(e).__name__}: {e}\n")
        sys.stderr.flush()
        traceback.print_exc(file=sys.stderr)
        sys.stderr.flush()
        request.response.status_code = 500
        return {'error': f'Login error: {str(e)}', 'type': type(e).__name__}
    finally:
        if session:
            try:
                session.close()
                sys.stderr.write("[LOGIN] Session closed\n")
                sys.stderr.flush()
            except:
                pass


@view_config(route_name='auth_google', request_method='POST', renderer='json')
def google_login(request):
    """Handle Google Login - Return user info and status"""
    session = get_db_session(request)
    try:
        data = request.json_body
        token = data.get('token')
        
        if not token:
            request.response.status_code = 400
            return {'error': 'Token is required'}

        id_info = None
        
        # Try to verify with Google first
        try:
            print(f'[INFO] Attempting to verify Google token with Google servers...')
            id_info = id_token.verify_oauth2_token(token, google_requests.Request())
            print(f'[SUCCESS] Token verified with Google servers')
        except Exception as verify_error:
            print(f'[WARNING] Google verification failed ({type(verify_error).__name__}): {str(verify_error)}')
            print(f'Attempting to decode JWT without verification (for development)...')
            
            # Fallback: decode JWT without verification
            try:
                parts = token.split('.')
                if len(parts) != 3:
                    request.response.status_code = 400
                    return {'error': f'Invalid token format (not a JWT): has {len(parts)} parts, expected 3'}
                
                # Decode the payload
                payload = parts[1]
                # Add padding if needed
                padding = 4 - len(payload) % 4
                if padding and padding != 4:
                    payload += '=' * padding
                
                decoded_bytes = base64.urlsafe_b64decode(payload)
                id_info = json.loads(decoded_bytes)
                print(f'[SUCCESS] JWT decoded successfully (unverified): {id_info.get("email")}')
            except Exception as decode_error:
                print(f'[ERROR] JWT decode failed: {type(decode_error).__name__}: {str(decode_error)}')
                traceback.print_exc()
                request.response.status_code = 400
                return {'error': f'Token decode failed: {str(decode_error)}'}
        
        if not id_info:
            request.response.status_code = 400
            return {'error': 'Could not extract info from token'}
        
        email = id_info.get('email')
        name = id_info.get('name')
        
        if not email:
            request.response.status_code = 400
            return {'error': 'Email not found in token'}

        print(f'[INFO] Email from token: {email}, Name: {name}')
        
        # Get role from request (required for new users, optional for existing)
        role_raw = data.get('role', 'patient')
        requested_role = role_raw.upper() if role_raw else 'PATIENT'
        
        # Check if user exists with retry logic for connection issues
        user = None
        max_query_retries = 3
        for query_attempt in range(max_query_retries):
            try:
                user = session.query(User).filter(User.email == email).first()
                break  # Success, exit retry loop
            except Exception as query_error:
                error_type = type(query_error).__name__
                error_msg = str(query_error)
                
                # Check if it's a connection-related error
                is_connection_error = (
                    'ConnectionTimeout' in error_type or
                    'OperationalError' in error_type or
                    'connection timeout' in error_msg.lower() or
                    'connection refused' in error_msg.lower() or
                    'timeout' in error_msg.lower()
                )
                
                if query_attempt < max_query_retries - 1 and is_connection_error:
                    wait_time = (query_attempt + 1) * 1  # 1s, 2s, 3s
                    print(f'[google_login] Query attempt {query_attempt + 1}/{max_query_retries} failed: {error_type}. Retrying in {wait_time}s...', file=sys.stderr, flush=True)
                    time.sleep(wait_time)
                    # Try to get a new session
                    try:
                        session.close()
                    except:
                        pass
                    session = get_db_session(request)
                    continue
                else:
                    # Last attempt failed or non-retryable error
                    print(f'[google_login] Query failed after {query_attempt + 1} attempts: {error_type}: {error_msg}', file=sys.stderr, flush=True)
                    raise
        
        if not user:
            # New user - return info for profile completion (don't create yet)
            print(f'[INFO] New user detected from Google: {email}, requested role: {requested_role}')
            return {
                'is_new_user': True,
                'email': email,
                'google_name': name or email.split('@')[0],
                'token': token,  # Return Google token for verification in complete step
                'requested_role': requested_role  # Pass role to complete step
            }
        
        # Fix legacy lowercase roles
        if user and user.role and user.role != user.role.upper():
            print(f'[INFO] Upgrading role to uppercase: {user.role} -> {user.role.upper()}')
            user.role = user.role.upper()
            session.commit()
        
        # Check for role mismatch - user exists but trying to login with different role
        user_role_upper = user.role.upper() if user.role else 'PATIENT'
        if requested_role and requested_role != user_role_upper:
            # User exists with different role
            if user_role_upper == 'PATIENT':
                request.response.status_code = 403
                return {'error': 'Akses ditolak: Akun Google ini terdaftar sebagai PASIEN. Silakan login melalui halaman login pasien atau gunakan akun Google yang berbeda.'}
            elif user_role_upper == 'DOCTOR':
                request.response.status_code = 403
                return {'error': 'Akses ditolak: Akun Google ini terdaftar sebagai DOKTER. Silakan login melalui halaman login dokter atau gunakan akun Google yang berbeda.'}
            else:
                request.response.status_code = 403
                return {'error': f'Akses ditolak: Akun Google ini terdaftar dengan role {user_role_upper}. Silakan login dengan role yang sesuai atau gunakan akun Google yang berbeda.'}

        # Ensure Doctor profile exists if role is DOCTOR (for existing users)
        if user.role == 'DOCTOR':
            from ..models import Doctor
            doctor = session.query(Doctor).filter(Doctor.user_id == user.id).first()
            if not doctor:
                print(f'[INFO] Creating missing Doctor profile for user {user.id}')
                doctor = Doctor(
                    user_id=user.id,
                    specialization='General Practitioner',
                    schedule={}
                )
                session.add(doctor)
                session.commit()

        # Login user (existing user, role matches)
        print(f'[INFO] User logged in: {email} with role {user.role}')
        app_token = generate_token(request, user.id, session=session)
        
        return {
            'message': 'Login successful',
            'is_new_user': False,
            'token': app_token,
            'user': user.to_dict()
        }
            
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        
        print(f'[ERROR] Unexpected error in google_login: {error_type}: {error_msg}')
        traceback.print_exc()
        
        try:
            session.rollback()
        except:
            pass
        
        # Provide user-friendly error messages for connection issues
        if 'ConnectionTimeout' in error_type or 'timeout' in error_msg.lower():
            request.response.status_code = 503  # Service Unavailable
            return {'error': 'Koneksi ke database timeout. Silakan coba lagi dalam beberapa saat.'}
        elif 'OperationalError' in error_type:
            request.response.status_code = 503
            return {'error': 'Tidak dapat terhubung ke database. Silakan coba lagi nanti.'}
        else:
            request.response.status_code = 500
            return {'error': f'Terjadi kesalahan server. Silakan coba lagi atau hubungi administrator.'}
    finally:
        try:
            session.close()
        except:
            pass

@view_config(route_name='auth_google_complete', request_method='POST', renderer='json')
def google_login_complete(request):
    """Complete Google registration - Create user with profile info"""
    session = get_db_session(request)
    try:
        data = request.json_body
        token = data.get('token')  # Google token from first step
        name = data.get('name')
        role = data.get('role', 'patient')
        
        if not token or not name:
            request.response.status_code = 400
            return {'error': 'Token and name are required'}

        try:
            # Verify the token again
            id_info = id_token.verify_oauth2_token(token, google_requests.Request())
            
            email = id_info.get('email')
            if not email:
                request.response.status_code = 400
                return {'error': 'Email not found in Google credentials'}
            # Check if user still doesn't exist (shouldn't happen but safety check)
            existing_user = session.query(User).filter(User.email == email).first()
            if existing_user:
                # User was created between steps, just login
                app_token = generate_token(request, existing_user.id, session=session)
                return {
                    'message': 'Login successful',
                    'is_new_user': False,
                    'token': app_token,
                    'user': existing_user.to_dict()
                }
            
            # Normalize role to uppercase
            role_upper = role.upper() if role else 'PATIENT'
            
            # Create new user with provided profile info
            random_pass = secrets.token_urlsafe(16)
            
            user = User(
                name=name,
                email=email,
                role=role_upper
            )
            user.set_password(random_pass)
            
            session.add(user)
            session.flush()
            
            # If role is doctor, create doctor profile with empty schedule
            if role_upper == 'DOCTOR':
                from ..models import Doctor
                doctor = Doctor(
                    user_id=user.id,
                    specialization='General Practitioner',  # Default, can be updated later
                    schedule={}  # Empty schedule, user will set it up later
                )
                session.add(doctor)
            
            session.commit()
            
            # Generate app token
            app_token = generate_token(request, user.id, session=session)
            
            return {
                'message': 'Profile created and login successful',
                'token': app_token,
                'user': user.to_dict()
            }
            
        except ValueError as e:
            request.response.status_code = 400
            return {'error': f'Invalid Google token: {str(e)}'}
            
    except Exception as e:
        session.rollback()
        import traceback
        traceback.print_exc()
        request.response.status_code = 500
        return {'error': f'Profile completion error: {str(e)}'}
    finally:
        session.close()


@view_config(route_name='auth_logout', request_method='POST', renderer='json')
def logout(request):
    """Logout user - invalidate token in database"""
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token_string = auth_header.replace('Bearer ', '')
        session = get_db_session(request)
        try:
            token = session.query(Token).filter(Token.token == token_string).first()
            if token:
                session.delete(token)
                session.commit()
        finally:
            session.close()
    
    return {'message': 'Logged out successfully'}


@view_config(route_name='auth_me', request_method='GET', renderer='json')
def get_me(request):
    """Get current authenticated user"""
    session = get_db_session(request)
    try:
        token_data = validate_token(request)
        if not token_data:
            return {'error': 'Not authenticated'}
        
        user = session.query(User).filter(User.id == token_data['user_id']).first()
        if not user:
            return {'error': 'User not found'}
        
        return {'user': user.to_dict()}
    finally:
        session.close()

@view_config(route_name='upload_profile_photo', request_method='POST', renderer='json')
def upload_profile_photo(request):
    """Upload profile photo for authenticated user"""
    from ..utils import upload_profile_photo as upload_to_cloudinary
    
    session = get_db_session(request)
    try:
        # Validate token
        token_data = validate_token(request)
        if not token_data:
            request.response.status_code = 401
            return {'error': 'Not authenticated'}
        
        # Get user
        user = session.query(User).filter(User.id == token_data['user_id']).first()
        if not user:
            request.response.status_code = 404
            return {'error': 'User not found'}
        
        # Get file from request
        if 'file' not in request.POST:
            request.response.status_code = 400
            return {'error': 'No file provided'}
        
        uploaded_file = request.POST['file']
        if not uploaded_file.filename:
            request.response.status_code = 400
            return {'error': 'Invalid file'}
        
        # Validate file type
        allowed_types = {'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'}
        content_type = uploaded_file.content_type
        if content_type not in allowed_types:
            request.response.status_code = 400
            return {'error': 'Invalid file type. Only JPEG, PNG, GIF, and WebP allowed'}
        
        # Check file size (max 5MB)
        file_content = uploaded_file.file.read()
        if len(file_content) > 5 * 1024 * 1024:  # 5MB
            request.response.status_code = 400
            return {'error': 'File size exceeds 5MB limit'}
        
        # Reset file pointer
        uploaded_file.file.seek(0)
        
        # Upload to Cloudinary
        try:
            photo_url = upload_to_cloudinary(uploaded_file.file, user.id)
            
            # Save URL to database
            user.profile_photo_url = photo_url
            session.commit()
            
            return {
                'success': True,
                'message': 'Profile photo uploaded successfully',
                'profile_photo_url': photo_url,
                'user': user.to_dict()
            }
        
        except Exception as e:
            session.rollback()
            request.response.status_code = 500
            return {'error': f'Upload failed: {str(e)}'}
    
    except Exception as e:
        request.response.status_code = 500
        return {'error': f'Server error: {str(e)}'}
    finally:
        session.close()