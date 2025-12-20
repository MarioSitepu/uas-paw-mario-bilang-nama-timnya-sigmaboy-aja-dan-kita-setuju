"""Cloudinary configuration and utilities for image upload"""
try:
    import cloudinary
    import cloudinary.uploader
    CLOUDINARY_AVAILABLE = True
except ImportError:
    CLOUDINARY_AVAILABLE = False
    cloudinary = None
    cloudinary_uploader = None

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Cloudinary immediately on module load (if available)
if CLOUDINARY_AVAILABLE:
    cloudinary.config(
        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', ''),
        api_key=os.getenv('CLOUDINARY_API_KEY', ''),
        api_secret=os.getenv('CLOUDINARY_API_SECRET', '')
    )

def upload_profile_photo(file_stream, user_id: int) -> str:
    """
    Upload profile photo to Cloudinary
    
    Args:
        file_stream: File object from request
        user_id: User ID for organizing uploads
        
    Returns:
        Secure URL of uploaded image
    """
    if not CLOUDINARY_AVAILABLE:
        raise Exception("Cloudinary is not available. Please install cloudinary package.")
    
    try:
        # Upload with public_id based on user_id for easy replacement
        result = cloudinary.uploader.upload(
            file_stream,
            folder=f"clinic/profile_photos",
            public_id=f"user_{user_id}",
            overwrite=True,
            resource_type='auto',
            quality='auto',
            fetch_format='auto',
            width=500,
            height=500,
            crop='fill',
            gravity='face'
        )
        
        return result.get('secure_url')
    
    except Exception as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")

def delete_profile_photo(user_id: int) -> bool:
    """
    Delete profile photo from Cloudinary
    
    Args:
        user_id: User ID to identify photo
        
    Returns:
        True if successful
    """
    if not CLOUDINARY_AVAILABLE:
        raise Exception("Cloudinary is not available. Please install cloudinary package.")
    
    try:
        cloudinary.uploader.destroy(
            f"clinic/profile_photos/user_{user_id}",
            resource_type='image'
        )
        
        return True
    
    except Exception as e:
        raise Exception(f"Cloudinary delete failed: {str(e)}")
