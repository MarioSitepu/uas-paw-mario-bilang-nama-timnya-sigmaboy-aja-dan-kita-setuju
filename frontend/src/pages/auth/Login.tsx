import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useToastContext } from '../../components/ui/Toast';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  const { login, googleLogin, isAuthenticated } = useAuth();
  const { addToast } = useToastContext();
  const navigate = useNavigate();

  // Auto-navigate when authenticated
  useEffect(() => {
    if (shouldNavigate && isAuthenticated) {
      console.log('🎯 isAuthenticated=true, navigating to /app');
      navigate('/app', { replace: true });
      setShouldNavigate(false);
    }
  }, [shouldNavigate, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      console.log('📝 Email/Password login attempt...');
      await login(email, password);
      console.log('✅ Login successful, setting flag to navigate');
      addToast('Login successful!', 'success');
      setShouldNavigate(true);
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Failed to login');
      addToast(err.message || 'Failed to login', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google login handler
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        console.log('🔐 Google credential received, calling googleLogin...');
        const result = await googleLogin(credentialResponse.credential);
        console.log('✅ googleLogin result:', result);
        
        // result.isNewUser tells us what to do
        if (result.isNewUser) {
          console.log('👤 New user detected, navigating to profile setup');
          addToast('Please complete your profile', 'info');
          navigate('/auth/complete-profile', { replace: true });
        } else {
          console.log('✓ Existing user, setting flag to navigate to app');
          addToast('Login successful!', 'success');
          setShouldNavigate(true);
        }
      }
    } catch (err: any) {
      console.error('❌ Google login error:', err);
      setError(err.message || 'Failed to login with Google');
      addToast(err.message || 'Failed to login with Google', 'error');
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
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
            <p className="text-slate-600">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-blue text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-pastel-blue-600 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError('Google Login Failed');
                  addToast('Google Login Failed', 'error');
                }}
              />
            </div>
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

