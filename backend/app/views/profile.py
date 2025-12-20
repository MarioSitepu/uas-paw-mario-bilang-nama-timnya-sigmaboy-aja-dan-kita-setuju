"""Profile-related views for users and doctors"""
from pyramid.view import view_config
from pyramid.httpexceptions import HTTPBadRequest, HTTPNotFound, HTTPUnauthorized, HTTPForbidden
from ..models import User, Doctor
import json
import traceback
import os
import uuid
from supabase import create_client, Client

# Supabase config
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://eeygswpiygbqdztagizv.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')
BUCKET_NAME = 'profile-pictures'

def get_supabase_client() -> Client:
    """Get Supabase client"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def get_db_session(request):
    """Get database session from request"""
    return request.registry.dbmaker()

def get_current_user(request):
    """Get current authenticated user from token"""
    from .auth import get_current_user as auth_get_current_user
    return auth_get_current_user(request)

@view_config(route_name='update_profile_photo', request_method='POST', renderer='json')
def update_profile_photo(request):
    """Upload and update user profile photo"""
    session = get_db_session(request)
    try:
        # Get current user from token
        user = get_current_user(request)
        if not user:
            request.response.status_code = 401
            return {'error': 'Not authenticated'}
        
        # Re-attach user to current session
        user = session.merge(user)
        
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
        
        # Upload to Supabase Storage
        try:
            supabase = get_supabase_client()
            
            # Generate unique filename
            ext = content_type.split('/')[-1]
            if ext == 'jpeg':
                ext = 'jpg'
            filename = f"{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
            
            # Delete old profile picture if exists
            if user.profile_photo_url:
                try:
                    # Extract filename from URL
                    old_url_parts = user.profile_photo_url.split('/')
                    if len(old_url_parts) > 0:
                        old_filename = old_url_parts[-1].split('?')[0]  # Remove query params
                        supabase.storage.from_(BUCKET_NAME).remove([old_filename])
                except Exception as e:
                    print(f'⚠️ Could not delete old photo: {e}')
                    pass  # Ignore errors deleting old file
            
            # Upload new file
            result = supabase.storage.from_(BUCKET_NAME).upload(
                filename,
                file_content,
                file_options={"content-type": content_type, "upsert": "true"}
            )
            
            # Get public URL
            public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(filename)
            
            # Save URL to database
            user.profile_photo_url = public_url
            session.commit()
            
            return {
                'success': True,
                'message': 'Profile photo updated successfully',
                'profile_photo_url': public_url,
                'user': user.to_dict()
            }
        
        except Exception as e:
            session.rollback()
            request.response.status_code = 500
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
        # Get current user from token
        user = get_current_user(request)
        if not user:
            request.response.status_code = 401
            return {'error': 'Not authenticated'}
        
        # Re-attach user to current session
        user = session.merge(user)
        
        profile_data = user.to_dict()
        
        # Add doctor-specific data if applicable
        if user.doctor_profile:
            profile_data['doctor_details'] = user.doctor_profile.to_dict()
        
        return {'profile': profile_data}
    
    except Exception as e:
        request.response.status_code = 500
        return {'error': f'Failed to get profile: {str(e)}'}
    finally:
        session.close()


@view_config(route_name='update_profile', request_method='PUT', renderer='json')
def update_profile(request):
    """Update user profile information (name, etc.)"""
    session = get_db_session(request)
    try:
        # Get current user from token
        user = get_current_user(request)
        if not user:
            request.response.status_code = 401
            return {'error': 'Not authenticated'}
        
        # Re-attach user to current session
        user = session.merge(user)
        
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
