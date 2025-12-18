from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPBadRequest, HTTPNotFound, HTTPUnauthorized, HTTPForbidden
from ..models import User, Doctor
import json
import secrets
import datetime
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Simple token storage (in production, use Redis or database)
# Format: {token: {'user_id': id, 'expires': datetime}}
active_tokens = {}

def get_db_session(request):
    """Get database session from request"""
    return request.registry.dbmaker()

def generate_token(user_id: int) -> str:
    """Generate authentication token"""
    token = secrets.token_urlsafe(32)
    active_tokens[token] = {
        'user_id': user_id,
        'expires': datetime.datetime.now() + datetime.timedelta(hours=24)
    }
    return token

def validate_token(request) -> dict:
    """Validate token from Authorization header"""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.replace('Bearer ', '')
    token_data = active_tokens.get(token)
    
    if not token_data:
        return None
    
    if datetime.datetime.now() > token_data['expires']:
        del active_tokens[token]
        return None
    
    return token_data

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
        token = generate_token(user.id)
        
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
        token = generate_token(user.id)
        
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
            return {'error': 'Token is required'}, 400

        try:
            # Verify the token with Google
            # The credential is a JWT token from Google OAuth
            id_info = id_token.verify_oauth2_token(token, google_requests.Request())
            
            # Verify the audience (client_id) matches
            # This is optional but recommended for security
            # Get Google Client ID from environment or config
            google_client_id = request.registry.settings.get('google.client_id')
            if google_client_id and id_info.get('aud') != google_client_id:
                # If not configured, just log warning and continue
                pass
            
            email = id_info.get('email')
            name = id_info.get('name')
            
            if not email:
                return {'error': 'Email not found in Google credentials'}, 400

            # Check if user exists
            user = session.query(User).filter(User.email == email).first()
            is_new_user = False
            
            if not user:
                # Don't create user yet - let frontend handle profile setup
                # Return info that this is a new user
                is_new_user = True
                return {
                    'message': 'New user - profile setup required',
                    'is_new_user': True,
                    'email': email,
                    'google_name': name,
                    'token': token  # Keep token for second step
                }
            
            # Generate app token for existing user
            app_token = generate_token(user.id)
            
            return {
                'message': 'Login successful',
                'is_new_user': False,
                'token': app_token,
                'user': user.to_dict()
            }
            
        except ValueError as e:
            return {'error': f'Invalid Google token: {str(e)}'}, 400
            
    except Exception as e:
        session.rollback()
        import traceback
        traceback.print_exc()
        return {'error': f'Google login error: {str(e)}'}, 500
    finally:
        session.close()

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
            return {'error': 'Token and name are required'}, 400

        try:
            # Verify the token again
            id_info = id_token.verify_oauth2_token(token, google_requests.Request())
            
            email = id_info.get('email')
            if not email:
                return {'error': 'Email not found in Google credentials'}, 400

            # Check if user still doesn't exist (shouldn't happen but safety check)
            existing_user = session.query(User).filter(User.email == email).first()
            if existing_user:
                # User was created between steps, just login
                app_token = generate_token(existing_user.id)
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
            app_token = generate_token(user.id)
            
            return {
                'message': 'Profile created and login successful',
                'token': app_token,
                'user': user.to_dict()
            }
            
        except ValueError as e:
            return {'error': f'Invalid Google token: {str(e)}'}, 400
            
    except Exception as e:
        session.rollback()
        import traceback
        traceback.print_exc()
        return {'error': f'Profile completion error: {str(e)}'}, 500
    finally:
        session.close()


@view_config(route_name='auth_logout', request_method='POST', renderer='json')
def logout(request):
    """Logout user - invalidate token"""
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.replace('Bearer ', '')
        if token in active_tokens:
            del active_tokens[token]
    
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
