import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToastContext } from '../../components/ui/Toast';
import { UserRole } from '../../types';

export const CompleteGoogleProfile: React.FC = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { completeGoogleProfile, googleProfileSetup } = useAuth();
  const { addToast } = useToastContext();
  const navigate = useNavigate();

  // Redirect if no pending profile setup
  React.useEffect(() => {
    if (!googleProfileSetup) {
      navigate('/auth/login', { replace: true });
    }
  }, [googleProfileSetup, navigate]);

  // Pre-fill with Google name
  React.useEffect(() => {
    if (googleProfileSetup?.googleName && !name) {
      setName(googleProfileSetup.googleName);
    }
  }, [googleProfileSetup?.googleName, name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!name.trim()) {
        throw new Error('Name is required');
      }

      await completeGoogleProfile(name, role);
      addToast('Profile created successfully!', 'success');
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
      addToast(err.message || 'Failed to create profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!googleProfileSetup) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-pastel py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Finishing setting up your account from Google
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={googleProfileSetup.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                I am a
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={UserRole.PATIENT}>Patient</option>
                <option value={UserRole.DOCTOR}>Doctor</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              {isSubmitting ? 'Creating Profile...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
