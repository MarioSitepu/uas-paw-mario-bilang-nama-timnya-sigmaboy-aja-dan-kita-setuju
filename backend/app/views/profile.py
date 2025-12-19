"""Profile-related views for users and doctors"""
from pyramid.view import view_config
from pyramid.httpexceptions import HTTPBadRequest, HTTPNotFound, HTTPUnauthorized, HTTPForbidden
from ..models import User, Doctor
from ..utils import upload_profile_photo as upload_to_cloudinary
import json
import traceback
from io import BytesIO

def get_db_session(request):
    """Get database session from request"""
    return request.registry.dbmaker()

def validate_token(request) -> dict:
    """Validate token from Authorization header - check database"""
    from .auth import validate_token as auth_validate_token
    return auth_validate_token(request)

@view_config(route_name='update_profile_photo', request_method='POST', renderer='json')
def update_profile_photo(request):
    """Upload and update user profile photo"""
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
        # In Pyramid, content_type is accessed via .type attribute
        content_type = getattr(uploaded_file, 'type', None) or getattr(uploaded_file, 'content_type', 'unknown')
        if content_type not in allowed_types:
            request.response.status_code = 400
            return {'error': f'Invalid file type. Only JPEG, PNG, GIF, and WebP allowed. Got: {content_type}'}
        
        # Read and validate file size
        file_content = uploaded_file.file.read()
        if len(file_content) > 5 * 1024 * 1024:  # 5MB
            request.response.status_code = 400
            return {'error': 'File size exceeds 5MB limit'}
        
        # Upload to Cloudinary with bytes
        try:
            file_stream = BytesIO(file_content)
            photo_url = upload_to_cloudinary(file_stream, user.id)
            
            # Save URL to database
            user.profile_photo_url = photo_url
            session.commit()
            
            return {
                'success': True,
                'message': 'Profile photo updated successfully',
                'profile_photo_url': photo_url,
                'user': user.to_dict()
            }
        
        except Exception as e:
            session.rollback()
            request.response.status_code = 500
            import traceback
            error_msg = f'Upload failed: {str(e)}'
            print(f'❌ Upload error: {error_msg}')
            print(f'Traceback: {traceback.format_exc()}')
            return {'error': error_msg}
    
    except Exception as e:
        session.rollback()
        request.response.status_code = 500
        import traceback
        error_msg = f'Internal server error: {str(e)}'
        print(f'❌ Server error: {error_msg}')
        print(f'Traceback: {traceback.format_exc()}')
        return {'error': error_msg}
    finally:
        session.close()


@view_config(route_name='get_profile', request_method='GET', renderer='json')
def get_profile(request):
    """Get profile of authenticated user with all details"""
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
        
        profile_data = user.to_dict()
        
        # Add doctor-specific data if applicable
        if user.doctor_profile:
            profile_data['doctor_details'] = user.doctor_profile.to_dict()
        
        return {'profile': profile_data}
    
    finally:
        session.close()


@view_config(route_name='update_profile', request_method='PUT', renderer='json')
def update_profile(request):
    """Update user profile information (name, etc.)"""
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
        
        # Parse JSON body
        try:
            data = request.json_body if hasattr(request, 'json_body') else json.loads(request.body)
        except:
            request.response.status_code = 400
            return {'error': 'Invalid JSON'}
        
        # Update allowed fields
        if 'name' in data and data['name']:
            user.name = data['name']
        
        session.commit()
        
        return {
            'success': True,
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }
    
    except Exception as e:
        session.rollback()
        request.response.status_code = 500
        return {'error': f'Update failed: {str(e)}'}
    finally:
        session.close()
