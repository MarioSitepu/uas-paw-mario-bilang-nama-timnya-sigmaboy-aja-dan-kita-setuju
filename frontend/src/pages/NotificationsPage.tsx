import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Filter, CheckCircle2, Calendar, X, Clock, AlertCircle } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Notification {
    id: number;
    title: string;
    message: string;
    appointment_id: number;
    is_read: boolean;
    created_at: string;
}

type FilterType = 'all' | 'unread' | 'read';

export const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            console.log('🔔 Fetching notifications from API...');
            const response = await notificationsAPI.getAll();
            console.log('📥 API Response:', response);
            console.log('   Notifications:', response.data.notifications);
            console.log('   Unread count:', response.data.unread_count);
            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unread_count || 0);
            console.log('✅ Notifications loaded successfully');
        } catch (error) {
            console.error('❌ Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    useEffect(() => {
        let result = notifications;

        // Apply filter
        if (filterType === 'unread') {
            result = result.filter(n => !n.is_read);
        } else if (filterType === 'read') {
            result = result.filter(n => n.is_read);
        }

        // Apply search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                n => n.title.toLowerCase().includes(query) || n.message.toLowerCase().includes(query)
            );
        }

        setFilteredNotifications(result);
    }, [notifications, filterType, searchQuery]);

    const handleMarkAsRead = async (id: number, appointmentId: number) => {
        try {
            await notificationsAPI.readOne(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            // Redirect to appointment
            if (!appointmentId) {
                console.warn('No appointmentId found for notification:', id);
                return;
            }

            const userRole = user?.role?.toLowerCase();
            if (userRole === 'doctor') {
                navigate(`/app/doctor/appointments/${appointmentId}`);
            } else {
                navigate(`/app/patient/appointments/${appointmentId}`);
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleToggleRead = async (id: number, isCurrentlyRead: boolean) => {
        try {
            if (isCurrentlyRead) {
                await notificationsAPI.unreadOne(id);
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: false } : n));
                setUnreadCount(prev => prev + 1);
            } else {
                await notificationsAPI.readOne(id);
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to toggle notification read status:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationsAPI.readAll();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getNotificationIcon = (title: string) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('confirmed')) {
            return <CheckCircle2 size={24} className="text-green-500" />;
        } else if (lowerTitle.includes('cancelled')) {
            return <X size={24} className="text-red-500" />;
        } else if (lowerTitle.includes('completed')) {
            return <CheckCircle2 size={24} className="text-blue-500" />;
        } else {
            return <Calendar size={24} className="text-amber-500" />;
        }
    };

    const formatDate = (dateString: string) => {
        // Parse the ISO string - ensure it's treated as UTC
        let dateStr = dateString;
        if (!dateStr.endsWith('Z')) {
            dateStr += 'Z'; // Add Z to explicitly mark as UTC if missing
        }
        const dateUtc = new Date(dateStr);
        
        // Get current time in UTC
        const nowUtc = new Date();
        
        // Calculate difference in milliseconds (this is timezone-independent)
        const diffMs = nowUtc.getTime() - dateUtc.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} min yang lalu`;
        if (diffHours < 24) return `${diffHours} jam yang lalu`;
        if (diffDays < 7) return `${diffDays} hari yang lalu`;
        
        // For older dates, show the UTC+7 formatted date
        const utcPlus7 = new Date(dateUtc.getTime() + (7 * 60 * 60 * 1000));
        return utcPlus7.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatFullDateTime = (dateString: string) => {
        // Parse the ISO string - ensure it's treated as UTC
        let dateStr = dateString;
        if (!dateStr.endsWith('Z')) {
            dateStr += 'Z'; // Add Z to explicitly mark as UTC if missing
        }
        const dateUtc = new Date(dateStr);
        
        // Convert to UTC+7 by adding 7 hours
        const utcPlus7 = new Date(dateUtc.getTime() + (7 * 60 * 60 * 1000));
        
        return utcPlus7.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }) + ' (UTC+7)';
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Bell size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
                        <p className="text-slate-500">
                            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All notifications read'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl p-4 shadow-lg mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="text-slate-400" size={20} />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as FilterType)}
                            className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 font-medium text-slate-700"
                        >
                            <option value="all">All Notifications</option>
                            <option value="unread">Unread Only</option>
                            <option value="read">Read Only</option>
                        </select>
                    </div>

                    {/* Mark All as Read Button */}
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 whitespace-nowrap"
                        >
                            Mark All Read
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-lg overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            {searchQuery || filterType !== 'all' ? (
                                <AlertCircle size={40} className="text-slate-300" />
                            ) : (
                                <Bell size={40} className="text-slate-300" />
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">
                            {searchQuery || filterType !== 'all' ? 'No matching notifications' : 'No notifications yet'}
                        </h3>
                        <p className="text-slate-500">
                            {searchQuery
                                ? 'Try adjusting your search or filter criteria'
                                : filterType !== 'all'
                                    ? `You have no ${filterType} notifications`
                                    : 'You will receive notifications about your appointments here'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-5 hover:bg-slate-50 transition-all relative group ${!notification.is_read ? 'bg-blue-50/50' : ''
                                    }`}
                            >
                                {/* Unread indicator */}
                                {!notification.is_read && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full"></div>
                                )}

                                <div className="flex gap-4">
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${notification.title.toLowerCase().includes('confirmed') ? 'bg-green-100' :
                                        notification.title.toLowerCase().includes('cancelled') ? 'bg-red-100' :
                                            notification.title.toLowerCase().includes('completed') ? 'bg-blue-100' :
                                                'bg-amber-100'
                                        }`}>
                                        {getNotificationIcon(notification.title)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-1">
                                            <div 
                                                onClick={() => handleMarkAsRead(notification.id, notification.appointment_id)}
                                                className="flex-1 cursor-pointer hover:opacity-80"
                                            >
                                                <h4 className={`font-semibold ${!notification.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                                                    {notification.title}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Clock size={14} className="text-slate-400" />
                                                <span 
                                                    className="text-xs text-slate-400 whitespace-nowrap cursor-help"
                                                    title={formatFullDateTime(notification.created_at)}
                                                >
                                                    {formatDate(notification.created_at)}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleRead(notification.id, notification.is_read);
                                                    }}
                                                    className="ml-2 px-2 py-1 rounded-lg text-xs font-medium transition-all opacity-0 group-hover:opacity-100 hover:bg-slate-200"
                                                    title={notification.is_read ? 'Mark as unread' : 'Mark as read'}
                                                >
                                                    {notification.is_read ? '↩️ Unread' : '✓ Read'}
                                                </button>
                                            </div>
                                        </div>
                                        <p 
                                            className="text-sm text-slate-600 line-clamp-2 cursor-pointer hover:opacity-80"
                                            onClick={() => handleMarkAsRead(notification.id, notification.appointment_id)}
                                        >
                                            {notification.message}
                                        </p>

                                        {/* Status badge */}
                                        {!notification.is_read && (
                                            <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                                Unread
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary */}
            {!loading && notifications.length > 0 && (
                <div className="mt-4 text-center text-sm text-slate-500">
                    Showing {filteredNotifications.length} of {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
