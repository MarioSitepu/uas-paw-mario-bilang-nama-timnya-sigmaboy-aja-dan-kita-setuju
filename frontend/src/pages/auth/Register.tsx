import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToastContext } from '../../components/ui/Toast';
import { UserRole } from '../../types';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
    specialization: string;
    license_number: string;
    phone: string;
    bio: string;
  }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.PATIENT,
    specialization: '',
    license_number: '',
    phone: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToastContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate doctor fields if registering as doctor
    if (formData.role === UserRole.DOCTOR) {
      if (!formData.specialization.trim()) {
        setError('Specialization is required for doctors');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const registerData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      // Include doctor fields if registering as doctor
      if (formData.role === UserRole.DOCTOR) {
        registerData.specialization = formData.specialization;
        if (formData.license_number) registerData.license_number = formData.license_number;
        if (formData.phone) registerData.phone = formData.phone;
        if (formData.bio) registerData.bio = formData.bio;
      }

      await register(registerData);
      addToast('Registration successful!', 'success');
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
      addToast(err.message || 'Failed to register', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-pastel py-12 px-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 shadow-glass">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-blue rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4">
              🏥
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Create Account</h2>
            <p className="text-slate-600">Join us today</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-all"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-all"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                I am a
              </label>
              <select
                id="role"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-all"
                value={formData.role}
                onChange={(e) => {
                  const value = e.target.value as any;
                  setFormData({ ...formData, role: value });
                }}
              >
                <option value={UserRole.PATIENT}>Patient</option>
                <option value={UserRole.DOCTOR}>Doctor</option>
              </select>
            </div>

            {/* Professional Information - Only for Doctors */}
            {formData.role === UserRole.DOCTOR && (
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Professional Information</h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-slate-700 mb-2">
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="specialization"
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-all"
                      placeholder="e.g., General Medicine, Cardiology"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="license_number" className="block text-sm font-medium text-slate-700 mb-2">
                      License Number
                    </label>
                    <input
                      id="license_number"
                      type="text"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-all"
                      placeholder="Your medical license number"
                      value={formData.license_number}
                      onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-all"
                      placeholder="Your contact number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-all resize-none"
                      placeholder="Tell patients about yourself"
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-all"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-blue text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-pastel-blue-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-800">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

