import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI, chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Notification {
    id: number;
    title: string;
    message: string;
    appointment_id: number;
    is_read: boolean;
    created_at: string;
}

export const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isPageVisible, setIsPageVisible] = useState(true);
    const [lastFetch, setLastFetch] = useState<number>(0);
    const [lastMessageFetch, setLastMessageFetch] = useState<number>(0);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Track page visibility
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsPageVisible(!document.hidden);
            // Fetch immediately when page becomes visible
            if (!document.hidden) {
                fetchNotifications();
                fetchUnreadMessages();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Listen for chat messages being read
        const handleChatMessagesRead = () => {
            console.log('📢 Chat messages read event received, refetching unread count...');
            fetchUnreadMessages();
        };
        window.addEventListener('chatMessagesRead', handleChatMessagesRead);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('chatMessagesRead', handleChatMessagesRead);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationsAPI.getAll();
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
            setLastFetch(Date.now());
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const fetchUnreadMessages = async () => {
        try {
            const response = await chatAPI.getUnreadCount();
            setUnreadMessageCount(response.data.count || 0);
            setLastMessageFetch(Date.now());
        } catch (error) {
            console.error('Failed to fetch unread messages:', error);
        }
    };

    useEffect(() => {
        if (user) {
            // Initial fetch immediately on login
            fetchNotifications();
            fetchUnreadMessages();
            
            // Poll every 5 minutes for notifications
            if (isPageVisible) {
                const interval = setInterval(() => {
                    const now = Date.now();
                    // Only fetch if more than 5 minutes since last fetch
                    if (now - lastFetch > 300000) {
                        fetchNotifications();
                    }
                }, 300000); // Check every 5 minutes

                return () => clearInterval(interval);
            }
        }
    }, [user, isPageVisible]);

    // Poll unread messages - reduced frequency to prevent overload
    useEffect(() => {
        if (!user || !isPageVisible) return;

        // Initial fetch
        fetchUnreadMessages();

        // Poll every 30 seconds instead of 10 to reduce server load
        const interval = setInterval(() => {
            const now = Date.now();
            // Only fetch if more than 30 seconds since last fetch
            if (now - lastMessageFetch > 30000) {
                fetchUnreadMessages();
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [user, isPageVisible, lastMessageFetch]);

    const handleMarkAsRead = async (id: number, appointmentId: number) => {
        try {
            await notificationsAPI.readOne(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            // Redirect to appointment
            const userRole = user?.role?.toLowerCase();
            if (userRole === 'doctor') {
                navigate(`/app/doctor/appointments/${appointmentId}`);
            } else {
                navigate(`/app/patient/appointments/${appointmentId}`);
            }
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationsAPI.readAll();
            setNotifications((prev: Notification[]) => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const totalUnread = unreadCount + unreadMessageCount;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
                <Bell className={`${totalUnread > 0 ? 'text-amber-500 fill-amber-500 animate-swing' : 'text-gray-500'}`} size={24} />
                {totalUnread > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {totalUnread}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all duration-200">
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Bell size={18} className="text-amber-500" />
                            Activity
                        </h3>
                        {(unreadCount > 0 || unreadMessageCount > 0) && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {unreadMessageCount > 0 && (
                            <div className="p-4 bg-blue-50 border-b border-blue-100">
                                <p className="text-sm font-bold text-blue-900 mb-1">💬 {unreadMessageCount} unread message{unreadMessageCount > 1 ? 's' : ''}</p>
                                <p className="text-xs text-blue-700">
                                    <a href="/app/patient/chat" className="font-semibold hover:underline" onClick={() => setIsOpen(false)}>
                                        Go to messages →
                                    </a>
                                </p>
                            </div>
                        )}
                        
                        {notifications.length === 0 && unreadMessageCount === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Bell size={24} className="text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-500">No activity yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleMarkAsRead(n.id, n.appointment_id)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${!n.is_read ? 'bg-primary-50/30' : ''}`}
                                    >
                                        {!n.is_read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500"></div>
                                        )}
                                        <div className="flex gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.title.toLowerCase().includes('confirmed') ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                {n.title.toLowerCase().includes('confirmed') ? <CheckCircle2 size={20} /> : <Calendar size={20} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{n.title}</p>
                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                    {n.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {(notifications.length > 0 || unreadMessageCount > 0) && (
                        <div className="p-3 bg-gray-50/50 border-t border-gray-50 text-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-xs font-bold text-gray-500 hover:text-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            )}
            <style>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
        }
        .animate-swing {
          animation: swing 2s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>
        </div>
    );
};
