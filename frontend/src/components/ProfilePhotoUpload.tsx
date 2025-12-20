import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProfilePhotoUploadProps {
  onSuccess?: (photoUrl: string) => void;
  className?: string;
  currentPhoto?: string | null;
  size?: 'small' | 'medium' | 'large';
  onLoadingChange?: (isLoading: boolean) => void;
}

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  onSuccess,
  className = '',
  currentPhoto = null,
  size = 'small',
  onLoadingChange
}) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentPhoto || user?.profile_photo_url || null);

  // Size mapping
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-40 h-40',
    large: 'w-48 h-48'
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, GIF, and WebP allowed');
      setSuccess(false);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      setSuccess(false);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:6543';
      const response = await fetch(`${apiUrl}/api/profile/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      const photoUrl = data.profile_photo_url || data.url || data.profile_photo_url;
      setPreview(photoUrl);
      
      // Call onSuccess callback first, then show success message
      if (onSuccess) {
        onSuccess(photoUrl);
      }
      
      // Set success state after callback
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setSuccess(false);
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`profile-photo-upload ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Photo Display */}
        <img
          src={preview || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23e2e8f0' width='100' height='100'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%3164748b'/%3E%3Cpath d='M20 85 Q20 65 50 65 Q80 65 80 85' fill='%3164748b'/%3E%3C/svg%3E`}
          alt="Profile"
          className={`w-full h-full rounded-full object-cover border-4 border-blue-200`}
        />

        {/* Upload Button Overlay */}
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className={`absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full p-2 shadow-lg transition ${
            size === 'large' ? 'p-3' : 'p-2'
          }`}
          title="Upload photo"
        >
          <svg
            className={`${size === 'large' ? 'w-6 h-6' : 'w-5 h-5'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Messages */}
      {error && (
        <div className="mt-2 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-2 text-sm text-green-600 font-medium">
          ✓ Photo updated successfully
        </div>
      )}

      {/* Help Text */}
      <p className="mt-2 text-xs text-gray-500">
        JPEG, PNG, GIF atau WebP. Max 5MB.
      </p>
    </div>
  );
};
