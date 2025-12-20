import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useToastContext } from '../../components/ui/Toast';
import { UserRole } from '../../types';
import { User, Stethoscope, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [showForm, setShowForm] = useState(false);

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

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    // Animate form appearance
    setTimeout(() => setShowForm(true), 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select your role first');
      return;
    }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-pastel py-12 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-64 h-64 bg-pastel-blue-200/30 rounded-full blur-3xl animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + i * 12}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + i * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-blue rounded-3xl shadow-2xl mb-6 transform hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-3">
            Selamat Datang Kembali
          </h1>
          <p className="text-lg text-slate-600">Pilih peran Anda untuk melanjutkan</p>
        </div>

        {/* Role Selection Cards */}
        {!showForm && (
          <div className="grid md:grid-cols-2 gap-6 mb-8 animate-slide-up">
            {/* Patient Card */}
            <button
              onClick={() => handleRoleSelect(UserRole.PATIENT)}
              className="group relative overflow-hidden glass-card rounded-3xl p-8 shadow-glass hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border-2 border-transparent hover:border-pastel-blue-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                  Pasien
                </h3>
                <p className="text-slate-600 mb-4">
                  Login sebagai pasien untuk membuat janji temu dan mengelola kesehatan Anda
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                  Pilih <span className="ml-2">→</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            </button>

            {/* Doctor Card */}
            <button
              onClick={() => handleRoleSelect(UserRole.DOCTOR)}
              className="group relative overflow-hidden glass-card rounded-3xl p-8 shadow-glass hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border-2 border-transparent hover:border-emerald-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">
                  Dokter
                </h3>
                <p className="text-slate-600 mb-4">
                  Login sebagai dokter untuk mengelola jadwal dan catatan medis pasien
                </p>
                <div className="flex items-center text-emerald-600 font-semibold group-hover:translate-x-2 transition-transform">
                  Pilih <span className="ml-2">→</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            </button>
          </div>
        )}

        {/* Login Form */}
        {showForm && selectedRole && (
          <div className="glass-card rounded-3xl p-8 shadow-glass animate-slide-up">
            {/* Back Button */}
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedRole(null);
                setError('');
              }}
              className="mb-6 flex items-center text-slate-600 hover:text-slate-800 transition-colors group"
            >
              <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
              Kembali ke pilihan
            </button>

            {/* Role Badge */}
            <div className="flex items-center justify-center mb-6">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${
                selectedRole === UserRole.PATIENT 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {selectedRole === UserRole.PATIENT ? (
                  <>
                    <User className="w-5 h-5" />
                    <span className="font-semibold">Login sebagai Pasien</span>
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-5 h-5" />
                    <span className="font-semibold">Login sebagai Dokter</span>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-all bg-white/80 backdrop-blur-sm"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-all bg-white/80 backdrop-blur-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] ${
                  selectedRole === UserRole.PATIENT
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 backdrop-blur-sm text-slate-500">Atau lanjutkan dengan</span>
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

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Belum punya akun?{' '}
                <Link to="/auth/register" className="text-pastel-blue-600 font-semibold hover:underline hover:text-pastel-blue-700">
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-8 text-center animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Kembali ke beranda
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

