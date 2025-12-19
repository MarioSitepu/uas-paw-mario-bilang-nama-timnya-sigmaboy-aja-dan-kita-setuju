from pyramid.view import view_config
from pyramid.response import Response
from ..models import User
from .auth import get_db_session, validate_token
import os
import base64
import uuid
from supabase import create_client, Client

# Supabase config - dari environment variables
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://eeygswpiygbqdztagizv.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')  # Service role key
BUCKET_NAME = 'profile-pictures'


def get_supabase_client() -> Client:
    """Get Supabase client"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)


@view_config(route_name='upload_profile_picture', request_method='POST', renderer='json')
def upload_profile_picture(request):
    """Upload profile picture to Supabase Storage"""
    # Validate token
    token_data = validate_token(request)
    if not token_data:
        request.response.status_code = 401
        return {'error': 'Not authenticated'}
    
    session = get_db_session(request)
    try:
        data = request.json_body
        image_data = data.get('image')  # Base64 encoded image
        
        if not image_data:
            request.response.status_code = 400
            return {'error': 'Image data is required'}
        
        # Parse base64 image
        if ',' in image_data:
            # Format: data:image/jpeg;base64,/9j/4AAQ...
            header, base64_data = image_data.split(',', 1)
            # Get content type
            content_type = header.split(':')[1].split(';')[0] if ':' in header else 'image/jpeg'
        else:
            base64_data = image_data
            content_type = 'image/jpeg'
        
        # Decode base64
        try:
            image_bytes = base64.b64decode(base64_data)
        except Exception as e:
            request.response.status_code = 400
            return {'error': f'Invalid base64 image: {str(e)}'}
        
        # Generate unique filename
        ext = content_type.split('/')[-1]
        if ext == 'jpeg':
            ext = 'jpg'
        filename = f"{token_data['user_id']}_{uuid.uuid4().hex[:8]}.{ext}"
        
        # Upload to Supabase
        try:
            supabase = get_supabase_client()
            
            # Delete old profile picture if exists
            user = session.query(User).filter(User.id == token_data['user_id']).first()
            if user and user.profile_photo_url:
                old_filename = user.profile_photo_url.split('/')[-1]
                try:
                    supabase.storage.from_(BUCKET_NAME).remove([old_filename])
                except:
                    pass  # Ignore errors deleting old file
            
            # Upload new file
            result = supabase.storage.from_(BUCKET_NAME).upload(
                filename,
                image_bytes,
                file_options={"content-type": content_type}
            )
            
            # Get public URL
            public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(filename)
            
            # Update user profile_photo_url in database
            if user:
                user.profile_photo_url = public_url
                session.commit()
            
            return {
                'message': 'Profile picture uploaded successfully',
                'url': public_url
            }
            
        except Exception as e:
            request.response.status_code = 500
            return {'error': f'Upload failed: {str(e)}'}
        
    except Exception as e:
        session.rollback()
        request.response.status_code = 500
        return {'error': f'Server error: {str(e)}'}
    finally:
        session.close()


@view_config(route_name='delete_profile_picture', request_method='DELETE', renderer='json')
def delete_profile_picture(request):
    """Delete profile picture"""
    token_data = validate_token(request)
    if not token_data:
        request.response.status_code = 401
        return {'error': 'Not authenticated'}
    
    session = get_db_session(request)
    try:
        user = session.query(User).filter(User.id == token_data['user_id']).first()
        
        if not user:
            request.response.status_code = 404
            return {'error': 'User not found'}
        
        if user.profile_photo_url:
            # Delete from Supabase
            try:
                supabase = get_supabase_client()
                filename = user.profile_photo_url.split('/')[-1]
                supabase.storage.from_(BUCKET_NAME).remove([filename])
            except:
                pass  # Ignore errors
            
            # Clear from database
            user.profile_photo_url = None
            session.commit()
        
        return {'message': 'Profile picture deleted successfully'}
        
    except Exception as e:
        session.rollback()
        request.response.status_code = 500
        return {'error': f'Server error: {str(e)}'}
    finally:
        session.close()
