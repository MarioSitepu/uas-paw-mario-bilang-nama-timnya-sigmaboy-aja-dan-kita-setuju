import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { useToastContext } from '../../components/ui/Toast';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const DoctorProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToastContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    specialization: '',
    phone: '',
    bio: '',
    license_number: '',
  });

  useEffect(() => {
    if (user?.doctor_profile?.id) {
      loadDoctorProfile();
    }
  }, [user]);

  const loadDoctorProfile = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.get(`/api/doctors/${user?.doctor_profile?.id}`);
      const doctor = response.data.doctor;
      console.log('📋 Loaded doctor profile:', doctor);
      
      setFormData({
        specialization: doctor.specialization || '',
        phone: doctor.phone || '',
        bio: doctor.bio || '',
        license_number: doctor.license_number || '',
      });
    } catch (error) {
      console.error('Failed to load doctor profile:', error);
      addToast('Failed to load profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.specialization.trim()) {
      addToast('Specialization is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('📝 Updating doctor profile with:', formData);
      const response = await authAPI.put(`/api/doctors/${user?.doctor_profile?.id}`, {
        specialization: formData.specialization,
        phone: formData.phone || null,
        bio: formData.bio || null,
        license_number: formData.license_number || null,
      });
      
      console.log('✅ Profile updated:', response.data);
      addToast('Profile updated successfully', 'success');
      
      // Redirect back after a moment
      setTimeout(() => {
        navigate('/app/doctor/dashboard');
      }, 800);
    } catch (error: any) {
      console.error('❌ Failed to update profile:', error);
      addToast(error.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <LoadingSkeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Doctor Profile</h1>
          <p className="text-slate-600">Edit your professional information</p>
        </div>
        <button
          onClick={() => navigate('/app/doctor/dashboard')}
          className="px-4 py-2 text-slate-600 hover:text-slate-800"
        >
          ← Back
        </button>
      </div>

      <div className="bento-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info (Read-only) */}
          <div className="pb-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Professional Info (Editable) */}
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Professional Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g. General Practitioner, Cardiologist, Pediatrician"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">License Number</label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  placeholder="Your medical license number"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell patients about yourself"
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate('/app/doctor/dashboard')}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-blue text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
