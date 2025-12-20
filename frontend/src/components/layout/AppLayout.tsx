import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topBarVisible, setTopBarVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollYRef.current;

        if (currentY < 16) {
          setTopBarVisible(true);
        } else if (delta > 8) {
          setTopBarVisible(false);
        } else if (delta < -8) {
          setTopBarVisible(true);
        }

        lastScrollYRef.current = currentY;
        rafId = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      Promise.resolve().then(() => setTopBarVisible(true));
    }
  }, [sidebarOpen]);

  const patientMenu = [
    { path: '/app/patient/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/app/patient/doctors', label: 'Find Doctors', icon: '👨‍⚕️' },
    { path: '/app/patient/appointments', label: 'My Appointments', icon: '📅' },
    { path: '/app/profile', label: 'Profile', icon: '👤' },
  ];

  const doctorMenu = [
    { path: '/app/doctor/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/app/doctor/schedule', label: 'Schedule', icon: '📅' },
    { path: '/app/doctor/records', label: 'Medical Records', icon: '📋' },
    { path: '/app/profile', label: 'Profile', icon: '👤' },
  ];

  const menu = user?.role === UserRole.PATIENT ? patientMenu : doctorMenu;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 glass-strong z-50 transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="h-full flex flex-col p-6">
          {/* Logo */}
          <Link to="/app" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-blue flex items-center justify-center text-white text-xl">
              🏥
            </div>
            <span className="text-xl font-bold text-slate-800">Clinic App</span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${
                    isActive(item.path)
                      ? 'bg-white/80 text-pastel-blue-700 shadow-md'
                      : 'text-slate-700 hover:bg-white/50'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="pt-4 border-t border-white/30">
            <div className="flex items-center gap-3 mb-4 px-4">
              <img
                src={user?.profile_photo_url || user?.photoUrl || `https://i.pravatar.cc/150?img=${user?.id || 1}`}
                alt={user?.name}
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                key={user?.profile_photo_url} // Force re-render when photo changes
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
                <p className="text-xs text-slate-600 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
            >
              <span>🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header
          className={[
            'fixed top-0 left-0 right-0 lg:left-64 z-40 glass-strong border-b border-white/30',
            'transition-transform duration-300 ease-out will-change-transform',
            topBarVisible ? 'translate-y-0' : '-translate-y-full',
          ].join(' ')}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-700 hover:text-slate-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 hidden sm:block">
                Welcome back, <span className="font-medium text-slate-800">{user?.name}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 pt-[88px]">{children}</main>
      </div>
    </div>
  );
};

