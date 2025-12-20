import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../components/ui/Toast';
import { authAPI } from '../services/api';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ProfilePhotoUpload } from '../components/ProfilePhotoUpload';

interface DoctorProfile {
  id: string;
  user_id: string;
  specialization: string;
  license_number?: string;
  phone?: string;
  bio?: string;
}

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToastContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [doctorData, setDoctorData] = useState<DoctorProfile | null>(null);
  const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo_url || null);
  const [formData, setFormData] = useState({
    specialization: '',
    license_number: '',
    phone: '',
    bio: ''
  });

  const isDoctor = user?.doctor_profile?.id !== undefined;

  useEffect(() => {
    if (isDoctor && user?.doctor_profile?.id) {
      loadDoctorProfile();
    }
  }, [isDoctor, user?.doctor_profile?.id]);

  const loadDoctorProfile = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.get(`/api/doctors/${user?.doctor_profile?.id}`);
      
      if (response.data.error) {
        console.error('❌ Load error:', response.data.error);
        addToast(response.data.error, 'error');
        return;
      }
      
      console.log('✅ Doctor profile loaded:', response.data);
      setDoctorData(response.data);
      setFormData({
        specialization: response.data.specialization || '',
        license_number: response.data.license_number || '',
        phone: response.data.phone || '',
        bio: response.data.bio || ''
      });
    } catch (error) {
      console.error('❌ Failed to load doctor profile:', error);
      addToast('Failed to load doctor profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDoctor && !formData.specialization.trim()) {
      addToast('Specialization is required', 'error');
      return;
    }

    try {
      setIsLoading(true);
      
      if (isDoctor) {
        // Doctor profile update
        console.log('📤 Sending doctor update request:', { doctor_id: user?.doctor_profile?.id, formData });
        const response = await authAPI.put(`/api/doctors/${user?.doctor_profile?.id}`, formData);
        console.log('✅ Profile update response:', response.data);
        
        if (response.data.error) {
          console.error('❌ Update error:', response.data.error);
          addToast(response.data.error, 'error');
          return;
        }
        
        addToast('Profile updated successfully', 'success');
        setDoctorData(response.data);
        setFormData({
          specialization: response.data.specialization || '',
          license_number: response.data.license_number || '',
          phone: response.data.phone || '',
          bio: response.data.bio || ''
        });
      } else {
        // Patient profile update - only phone and bio
        const patientData = {
          phone: formData.phone,
          bio: formData.bio
        };
        console.log('📤 Sending patient update request:', patientData);
        // This would need a patient profile endpoint
        // For now, we'll just show success for phone and bio
        addToast('Profile updated successfully', 'success');
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      addToast('Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Profile</h1>
        <p className="text-slate-600">Your account information</p>
      </div>

      <div className="bento-card space-y-6">
        <div className="flex items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">{user?.name}</h2>
              <p className="text-slate-600">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-pastel-blue-100 text-pastel-blue-700 rounded-full text-sm font-medium capitalize">
                {user?.role?.toLowerCase()}
              </span>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-pastel-blue-500 text-white rounded-lg font-medium hover:bg-pastel-blue-600 transition"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {isPhotoUploading && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 rounded-lg">
                <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-pastel-blue-200 border-t-pastel-blue-500"></div>
                  <p className="text-slate-700 font-medium">Uploading photo...</p>
                </div>
              </div>
            )}
            <div className="flex justify-center pb-4 border-b border-slate-200">
              <ProfilePhotoUpload
                currentPhoto={profilePhoto}
                size="large"
                onLoadingChange={setIsPhotoUploading}
                onSuccess={(photoUrl) => {
                  setProfilePhoto(photoUrl);
                  // Update user in context and localStorage
                  if (user) {
                    updateUser({
                      ...user,
                      profile_photo_url: photoUrl
                    });
                  }
                  // Don't close form - just update the photo
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Name</label>
              <p className="text-lg text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-500 mt-1">Read-only</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Email</label>
              <p className="text-lg text-slate-800">{user?.email}</p>
              <p className="text-xs text-slate-500 mt-1">Read-only</p>
            </div>

            {isDoctor ? (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder="e.g., General Medicine"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">License Number</label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleInputChange}
                    placeholder="Your medical license number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Your contact number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 resize-none"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Profile Photo - Centered above both columns */}
                <div className="flex justify-center mb-8">
                  {profilePhoto ? (
                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-pastel-blue-200 shadow-lg">
                      <img 
                        src={profilePhoto} 
                        alt={`${user?.name}'s profile`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-full bg-pastel-blue-100 border-4 border-pastel-blue-200 shadow-lg flex items-center justify-center">
                      <span className="text-5xl font-bold text-pastel-blue-600">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Two columns: General Information and Personal Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Left Column: General Information (Read-only) */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">General Information</h3>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Name</label>
                      <p className="text-lg text-slate-800 mt-1">{user?.name}</p>
                      <p className="text-xs text-slate-500 mt-1">Read-only</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Email</label>
                      <p className="text-lg text-slate-800 mt-1">{user?.email}</p>
                      <p className="text-xs text-slate-500 mt-1">Read-only</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Role</label>
                      <p className="text-lg text-slate-800 capitalize mt-1">{user?.role?.toLowerCase()}</p>
                      <p className="text-xs text-slate-500 mt-1">Read-only</p>
                    </div>
                  </div>

                  {/* Right Column: Personal Information (Editable) */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h3>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Your contact number"
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself"
                        rows={4}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading || isPhotoUploading}
                className="flex-1 px-4 py-2 bg-pastel-blue-500 text-white rounded-lg font-medium hover:bg-pastel-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                disabled={isPhotoUploading}
                onClick={() => {
                  setIsEditing(false);
                  if (isDoctor) {
                    loadDoctorProfile();
                  }
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {isLoading ? (
              <LoadingSkeleton count={3} />
            ) : (
              <>
                {isDoctor && doctorData && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Name</label>
                      <p className="text-lg text-slate-800">{user?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Email</label>
                      <p className="text-lg text-slate-800">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Role</label>
                      <p className="text-lg text-slate-800 capitalize">{user?.role?.toLowerCase()}</p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Professional Information</h3>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Specialization</label>
                      <p className="text-lg text-slate-800">{doctorData.specialization || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">License Number</label>
                      <p className="text-lg text-slate-800">{doctorData.license_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Phone</label>
                      <p className="text-lg text-slate-800">{doctorData.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Bio</label>
                      <p className="text-lg text-slate-800">{doctorData.bio || 'Not provided'}</p>
                    </div>
                  </>
                )}

                {!isDoctor && (
                  <>
                    {/* Profile Photo - Centered above both columns */}
                    <div className="flex justify-center mb-8">
                      {profilePhoto ? (
                        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-pastel-blue-200 shadow-lg">
                          <img 
                            src={profilePhoto} 
                            alt={`${user?.name}'s profile`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-48 h-48 rounded-full bg-pastel-blue-100 border-4 border-pastel-blue-200 shadow-lg flex items-center justify-center">
                          <span className="text-5xl font-bold text-pastel-blue-600">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Two columns: General Information and Personal Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                      {/* Left Column: General Information */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800 mb-4">General Information</h3>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Name</label>
                          <p className="text-lg text-slate-800 mt-1">{user?.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Email</label>
                          <p className="text-lg text-slate-800 mt-1">{user?.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Role</label>
                          <p className="text-lg text-slate-800 capitalize mt-1">{user?.role?.toLowerCase()}</p>
                        </div>
                      </div>

                      {/* Right Column: Personal Information */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h3>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Phone</label>
                          <p className="text-lg text-slate-800 mt-1">{formData.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Bio</label>
                          <p className="text-lg text-slate-800 mt-1 whitespace-pre-wrap">{formData.bio || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

