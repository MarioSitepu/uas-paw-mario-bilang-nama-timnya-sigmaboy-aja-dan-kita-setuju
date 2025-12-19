from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPBadRequest, HTTPNotFound, HTTPUnauthorized, HTTPForbidden
from ..models import User, Doctor, Token
import json
import secrets
import datetime
import base64
import traceback
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

def get_db_session(request):
    """Get database session from request"""
    return request.registry.dbmaker()

def generate_token(request, user_id: int) -> str:
    """Generate authentication token - stored in database"""
    session = get_db_session(request)
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
    """Require authentication - returns user or returns error dict"""
    user = get_current_user(request)
    if not user:
        return None
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
        
        # Generate token
        token = generate_token(request, user.id)
        
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
    session = get_db_session(request)
    try:
        data = request.json_body
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return {'error': 'Email and password are required'}
        
        user = session.query(User).filter(User.email == email).first()
        
        if not user or not user.check_password(password):
            return {'error': 'Invalid email or password'}
        
        # Generate token
        token = generate_token(request, user.id)
        
        return {
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }
    finally:
        session.close()


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
            print(f'🔐 Attempting to verify Google token with Google servers...')
            id_info = id_token.verify_oauth2_token(token, google_requests.Request())
            print(f'✅ Token verified with Google servers')
        except Exception as verify_error:
            print(f'⚠️  Google verification failed ({type(verify_error).__name__}): {str(verify_error)}')
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
                print(f'✅ JWT decoded successfully (unverified): {id_info.get("email")}')
            except Exception as decode_error:
                print(f'❌ JWT decode failed: {type(decode_error).__name__}: {str(decode_error)}')
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

        print(f'📧 Email from token: {email}, Name: {name}')
        
        # Check if user exists
        user = session.query(User).filter(User.email == email).first()
        
        if not user:
            # New user - let frontend handle profile setup
            print(f'👤 New user detected: {email}')
            return {
                'message': 'New user - profile setup required',
                'is_new_user': True,
                'email': email,
                'google_name': name,
                'token': token  # Keep token for second step
            }
        
        # Existing user - login
        print(f'✓ Existing user logged in: {email}')
        app_token = generate_token(request, user.id)
        
        return {
            'message': 'Login successful',
            'is_new_user': False,
            'token': app_token,
            'user': user.to_dict()
        }
            
    except Exception as e:
        print(f'❌ Unexpected error in google_login: {type(e).__name__}: {str(e)}')
        traceback.print_exc()
        try:
            session.rollback()
        except:
            pass
        request.response.status_code = 500
        return {'error': f'Server error: {type(e).__name__}: {str(e)}'}
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
                app_token = generate_token(request, existing_user.id)
                return {
                    'message': 'Login successful',
                    'is_new_user': False,
                    'token': app_token,
                    'user': existing_user.to_dict()
                }
            
            # Create new user with provided profile info
            random_pass = secrets.token_urlsafe(16)
            
            user = User(
                name=name,
                email=email,
                role=role
            )
            user.set_password(random_pass)
            
            session.add(user)
            session.flush()
            
            # If role is doctor, create doctor profile
            if role == 'doctor':
                doctor = Doctor(
                    user_id=user.id,
                    specialization='General Practitioner'  # Default, can be updated later
                )
                session.add(doctor)
            
            session.commit()
            
            # Generate app token
            app_token = generate_token(request, user.id)
            
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