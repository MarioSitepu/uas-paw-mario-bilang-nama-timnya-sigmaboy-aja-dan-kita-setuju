import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  Stethoscope,
  Calendar,
  User,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Activity,
  Bell,
  MessageSquare,
  LucideIcon
} from 'lucide-react';
import { notificationsAPI, chatAPI } from '../../services/api';

interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  isNotification?: boolean;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }: AppLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topBarVisible, setTopBarVisible] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
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

  // Fetch unread notification count
  useEffect(() => {
    const fetchCounts = async () => {
      if (user) {
        try {
          // Fetch notifications count
          const notifResponse = await notificationsAPI.getAll();
          // Calculate unread if backend returns list, or use property if available
          // Based on DoctorDashboard logic, it returns list.
          const notifs = notifResponse.data.notifications || notifResponse.data;
          if (Array.isArray(notifs)) {
            setUnreadCount(notifs.filter((n: { is_read: boolean }) => !n.is_read).length);
          }

          // Fetch chat count
          const chatResponse = await chatAPI.getUnreadCount();
          setUnreadChatCount(chatResponse.data.count || 0);

        } catch (error) {
          console.error('Failed to fetch counts:', error);
        }
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 10000); // 10s poll for snappier UI
    return () => clearInterval(interval);
  }, [user]);

  const patientMenu = [
    { path: '/app/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/patient/doctors', label: 'Find Doctors', icon: Stethoscope },
    { path: '/app/patient/appointments', label: 'My Appointments', icon: Calendar },
    { path: '/app/notifications', label: 'Notifications', icon: Bell, isNotification: true },
    { path: '/app/messages', label: 'Pesan', icon: MessageSquare, badge: unreadChatCount },
    { path: '/app/profile', label: 'Profile', icon: User },
  ];

  const doctorMenu = [
    { path: '/app/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/doctor/schedule', label: 'Schedule', icon: Calendar },
    { path: '/app/doctor/records', label: 'Medical Records', icon: ClipboardList },
    { path: '/app/notifications', label: 'Notifications', icon: Bell, isNotification: true },
    { path: '/app/messages', label: 'Pesan', icon: MessageSquare, badge: unreadChatCount },
    { path: '/app/profile', label: 'Profile', icon: User },
  ];

  const menu = user?.role === UserRole.PATIENT ? patientMenu : doctorMenu;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 glass-strong z-50 transform transition-transform duration-300 border-r border-white/40 shadow-xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="h-full flex flex-col p-6">
          {/* Logo */}
          <Link to="/app" className="flex items-center gap-3 mb-10 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
              Clinic App
            </span>
            <button
              className="lg:hidden ml-auto text-slate-400 hover:text-slate-600"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menu.map((item: MenuItem) => {
              const Icon: LucideIcon = item.icon;
              const isNotificationItem: boolean = 'isNotification' in item && item.isNotification === true;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                    ${isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-600 hover:bg-white/50 hover:text-blue-700'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                  <span className="font-medium">{item.label}</span>
                  {isNotificationItem && unreadCount > 0 && (
                    <span className="ml-auto flex items-center justify-center min-w-[24px] h-6 px-2 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  {/* Chat Badge */}
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto flex items-center justify-center min-w-[24px] h-6 px-2 bg-blue-500 text-white text-xs font-bold rounded-full shadow-sm animate-pulse">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="pt-6 border-t border-slate-200/60">
            {/* Hide user info (photo and name) when on profile page */}
            {location.pathname !== '/app/profile' && (
              <div className="flex items-center gap-3 mb-4 px-2">
                <img
                  src={user?.profile_photo_url || user?.photoUrl || `https://i.pravatar.cc/150?img=${user?.id || 1}`}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
                  key={user?.profile_photo_url}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize bg-slate-100 inline-block px-2 py-0.5 rounded-full mt-0.5">
                    {user?.role?.toLowerCase()}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-medium group"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Top Bar */}
        <header
          className={[
            'fixed top-0 left-0 right-0 lg:left-64 z-40 glass-strong border-b border-white/40',
            'transition-transform duration-300 ease-out will-change-transform',
            topBarVisible ? 'translate-y-0' : '-translate-y-full',
          ].join(' ')}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-600 hover:text-slate-900 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
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
