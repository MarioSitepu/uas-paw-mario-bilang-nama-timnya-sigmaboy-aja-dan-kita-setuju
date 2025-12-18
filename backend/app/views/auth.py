from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPBadRequest, HTTPNotFound, HTTPUnauthorized, HTTPForbidden
from ..models import User
import json
import secrets
import datetime
import re
import hashlib
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Simple token storage (in production, use Redis or database)
# Format: {token_hash: {'user_id': id, 'expires': datetime}}
active_tokens = {}

# Rate limiting storage: {ip: {'count': int, 'reset_time': datetime}}
login_attempts = {}
MAX_LOGIN_ATTEMPTS = 5
LOGIN_LOCKOUT_MINUTES = 15

def get_db_session(request):
    """Get database session from request"""
    return request.registry.dbmaker()

def hash_token(token: str) -> str:
    """Hash token for secure storage"""
    return hashlib.sha256(token.encode()).hexdigest()

def validate_password_strength(password: str) -> tuple:
    """Validate password meets security requirements"""
    if len(password) < 8:
        return False, "Password minimal 8 karakter"
    if not re.search(r'[A-Z]', password):
        return False, "Password harus mengandung minimal 1 huruf besar"
    if not re.search(r'[a-z]', password):
        return False, "Password harus mengandung minimal 1 huruf kecil"
    if not re.search(r'\d', password):
        return False, "Password harus mengandung minimal 1 angka"
    return True, ""

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def check_rate_limit(ip: str) -> tuple:
    """Check if IP is rate limited for login attempts"""
    now = datetime.datetime.now()
    
    if ip in login_attempts:
        attempt_data = login_attempts[ip]
        # Reset if lockout period has passed
        if now > attempt_data['reset_time']:
            login_attempts[ip] = {'count': 0, 'reset_time': now + datetime.timedelta(minutes=LOGIN_LOCKOUT_MINUTES)}
            return True, ""
        
        if attempt_data['count'] >= MAX_LOGIN_ATTEMPTS:
            remaining = (attempt_data['reset_time'] - now).seconds // 60
            return False, f"Terlalu banyak percobaan login. Coba lagi dalam {remaining + 1} menit"
    else:
        login_attempts[ip] = {'count': 0, 'reset_time': now + datetime.timedelta(minutes=LOGIN_LOCKOUT_MINUTES)}
    
    return True, ""

def record_login_attempt(ip: str, success: bool):
    """Record login attempt for rate limiting"""
    if ip not in login_attempts:
        login_attempts[ip] = {'count': 0, 'reset_time': datetime.datetime.now() + datetime.timedelta(minutes=LOGIN_LOCKOUT_MINUTES)}
    
    if success:
        # Reset on successful login
        login_attempts[ip]['count'] = 0
    else:
        login_attempts[ip]['count'] += 1

def generate_token(user_id: int) -> str:
    """Generate authentication token"""
    token = secrets.token_urlsafe(32)
    token_hash = hash_token(token)
    active_tokens[token_hash] = {
        'user_id': user_id,
        'expires': datetime.datetime.now() + datetime.timedelta(hours=8)  # Reduced from 24h to 8h
    }
    return token

def validate_token(request) -> dict:
    """Validate token from Authorization header"""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.replace('Bearer ', '')
    token_hash = hash_token(token)
    token_data = active_tokens.get(token_hash)
    
    if not token_data:
        return None
    
    if datetime.datetime.now() > token_data['expires']:
        del active_tokens[token_hash]
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
        return user
    finally:
        session.close()

def require_auth(request):
    """Require authentication - returns user or raises HTTPUnauthorized"""
    user = get_current_user(request)
    if not user:
        raise HTTPUnauthorized(json_body={'error': 'Authentication required'})
    return user

def require_role(request, roles):
    """Require specific role(s) - roles can be string or list"""
    user = require_auth(request)
    if isinstance(roles, str):
        roles = [roles]
    if user.role not in roles:
        raise HTTPForbidden(json_body={'error': f'Access denied. Required role: {", ".join(roles)}'})
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
                return {'error': f'{field} is required'}
        
        # Validate email format
        if not validate_email(data['email']):
            return {'error': 'Format email tidak valid'}
        
        # Validate password strength
        is_valid, error_msg = validate_password_strength(data['password'])
        if not is_valid:
            return {'error': error_msg}
        
        # Sanitize name - prevent XSS
        name = data['name'].strip()[:100]  # Limit length
        if not name or len(name) < 2:
            return {'error': 'Nama minimal 2 karakter'}
        
        # Check email uniqueness
        existing = session.query(User).filter(User.email == data['email'].lower()).first()
        if existing:
            return {'error': 'Email already registered'}
        
        # Validate role - only allow patient registration, doctor needs admin approval
        role = data.get('role', 'patient')
        if role not in ['patient', 'doctor']:
            role = 'patient'
        
        # Create user
        user = User(
            name=name,
            email=data['email'].lower(),  # Normalize email to lowercase
            role=role
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
        # Get client IP for rate limiting
        client_ip = request.client_addr or request.headers.get('X-Forwarded-For', 'unknown')
        
        # Check rate limit
        allowed, error_msg = check_rate_limit(client_ip)
        if not allowed:
            return {'error': error_msg}
        
        data = request.json_body
        
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')
        
        if not email or not password:
            return {'error': 'Email and password are required'}
        
        user = session.query(User).filter(User.email == email).first()
        
        if not user or not user.check_password(password):
            # Record failed attempt
            record_login_attempt(client_ip, False)
            # Use generic message to prevent user enumeration
            return {'error': 'Email atau password salah'}
        
        # Record successful login
        record_login_attempt(client_ip, True)
        
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
    """Handle Google Login"""
    session = get_db_session(request)
    try:
        data = request.json_body
        token = data.get('token')
        
        if not token:
            return {'error': 'Token is required'}, 400

        try:
            # Verify the token
            # Note: client_id is optional but recommended if you have multiple clients
            id_info = id_token.verify_oauth2_token(token, google_requests.Request())
            
            email = id_info.get('email')
            name = id_info.get('name')
            
            if not email:
                return {'error': 'Email not found in Google credentials'}, 400

            # Check if user exists
            user = session.query(User).filter(User.email == email).first()
            
            if not user:
                # Create new user automatically
                # Generate random password since user logs in via Google
                random_pass = secrets.token_urlsafe(16)
                
                user = User(
                    name=name,
                    email=email,
                    role='patient' # Default role for Google Login
                )
                user.set_password(random_pass)
                
                session.add(user)
                session.flush()
                session.commit()
            
            # Generate app token
            app_token = generate_token(user.id)
            
            return {
                'message': 'Login successful',
                'token': app_token,
                'user': user.to_dict()
            }
            
        except ValueError as e:
            return {'error': 'Invalid Google token'}, 400
            
    except Exception as e:
        session.rollback()
        return {'error': str(e)}, 500
    finally:
        session.close()


@view_config(route_name='auth_logout', request_method='POST', renderer='json')
def logout(request):
    """Logout user - invalidate token"""
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.replace('Bearer ', '')
        token_hash = hash_token(token)
        if token_hash in active_tokens:
            del active_tokens[token_hash]
    
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
