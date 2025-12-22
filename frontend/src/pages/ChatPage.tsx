import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Send, Search, Phone, Video, MoreVertical, ArrowLeft, Image as ImageIcon, Paperclip, MessageSquare } from 'lucide-react';
import { chatAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

interface User {
    id: number;
    name: string;
    photoUrl: string;
    role: string;
    unreadCount?: number;
    lastMessage?: string;
    lastMessageTime?: string;
}

interface Message {
    id: number;
    senderId: number;
    content: string;
    createdAt: string;
    isRead: boolean;
}

const ChatPage: React.FC = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const { doctorId } = useParams<{ doctorId?: string }>();
    const [conversations, setConversations] = useState<User[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);
    const [lastMessageId, setLastMessageId] = useState<number | null>(null);
    const [isPageVisible, setIsPageVisible] = useState(true);
    const [lastConvoFetch, setLastConvoFetch] = useState<number>(0);
    const [userSelectedPartnerId, setUserSelectedPartnerId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Track visibility for smart polling
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsPageVisible(!document.hidden);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Fetch conversations with smart polling (longer interval, only when visible)
    useEffect(() => {
        // Always fetch on page load or when visibility changes
        fetchConversations();
        
        if (!isPageVisible) return;
        
        // Poll only every 2 minutes when page is visible
        const interval = setInterval(() => {
            const now = Date.now();
            // Only fetch if more than 2 minutes since last fetch
            if (now - lastConvoFetch > 120000) {
                fetchConversations();
            }
        }, 120000); // Check every 2 minutes

        return () => clearInterval(interval);
    }, [isPageVisible]);

    // Smart polling for messages - fetch only after user sends or page becomes visible
    useEffect(() => {
        if (!selectedPartner) return;

        let interval: NodeJS.Timeout | null = null;
        let pollCount = 0;

        // Initial fetch
        const smartFetchMessages = async () => {
            // Only fetch if page is visible OR if very recently sent a message
            if (isPageVisible || pollCount < 3) {
                await fetchMessages(selectedPartner.id);
                pollCount++;
            } else if (pollCount >= 3) {
                // Stop polling after 3 checks if page is hidden
                if (interval) clearInterval(interval);
            }
        };

        smartFetchMessages();

        // Poll only every 15 seconds instead of 5 seconds
        interval = setInterval(smartFetchMessages, 15000);

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [selectedPartner, isPageVisible]);

    // Auto-select partner from URL - only if user hasn't manually selected someone else
    useEffect(() => {
        const partnerId = searchParams.get('partnerId') || doctorId;
        if (partnerId) {
            const pid = parseInt(partnerId);
            
            // Only auto-select if user hasn't manually selected a different partner
            if (userSelectedPartnerId !== null && userSelectedPartnerId !== pid) {
                // User has manually selected a conversation, don't override
                return;
            }

            const partner = conversations.find((c: User) => c.id === pid);

            if (partner) {
                setSelectedPartner(partner);
                // Clear manual selection to allow URL-based selection again
                if (userSelectedPartnerId === pid) {
                    setUserSelectedPartnerId(null);
                }
            } else {
                // Check sessionStorage first for recently clicked doctor from Find Doctors page
                const cachedUserData = sessionStorage.getItem(`chatUser_${pid}`);
                if (cachedUserData) {
                    try {
                        const cachedUser = JSON.parse(cachedUserData);
                        const cachedUserFormatted: User = {
                            id: cachedUser.id || pid,
                            name: cachedUser.name || 'Unknown User',
                            photoUrl: cachedUser.photoUrl || `https://ui-avatars.com/api/?name=${cachedUser.name}&background=random`,
                            role: cachedUser.role || 'doctor',
                            unreadCount: 0
                        };
                        console.log('✅ Using cached user from sessionStorage:', cachedUserFormatted);
                        setSelectedPartner(cachedUserFormatted);
                        // Don't clear cache - let it persist for this session
                        // Cache will auto-clear when browser session ends
                        return;
                    } catch (e) {
                        console.error('Failed to parse cached user:', e);
                    }
                }

                // Fetch user details for new chat (partner not in conversation list yet)
                fetchPartnerAsync(pid);
            }
        }
    }, [doctorId, conversations, userSelectedPartnerId]);

    const fetchPartnerAsync = async (pid: number) => {
        try {
            console.log(`👤 Fetching partner details for ID: ${pid}...`);
            const response = await chatAPI.getUser(pid);
            console.log('📥 Partner response:', response.data);
            const userData = response.data.user || response.data;

            const newUser: User = {
                id: userData.id,
                name: userData.name || userData.fullName || 'Unknown User',
                photoUrl: userData.photo_url || userData.profile_photo_url || userData.photoUrl || '',
                role: userData.role,
                unreadCount: 0
            };

            console.log('✅ Partner loaded:', newUser);
            setSelectedPartner(newUser);
        } catch (error) {
            console.error('Failed to fetch partner details:', error);
            // Fallback: create a minimal user with just ID
            // This allows sending messages even if user details fetch fails
            const fallbackUser: User = {
                id: pid,
                name: 'User',
                photoUrl: `https://ui-avatars.com/api/?name=User&background=random`,
                role: 'doctor',
                unreadCount: 0
            };
            console.log('⚠️ Using fallback user:', fallbackUser);
            setSelectedPartner(fallbackUser);
        }
    };

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        setLoading(true);
        setLastConvoFetch(Date.now());
        try {
            console.log('💬 Fetching conversations...');
            const response = await chatAPI.getConversations();
            console.log('📥 Conversations response:', response.data);
            const convos = Array.isArray(response.data) ? response.data : (response.data?.conversations || []);
            setConversations(convos);
            console.log(`✅ Loaded ${convos.length} conversation(s)`);
        } catch (error) {
            console.error('❌ Failed to fetch conversations', error);
            setConversations([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await chatAPI.getUnreadCount();
            // Update unread count in conversations
            setConversations(prev => prev.map(c => 
                c.id === selectedPartner?.id ? { ...c, unreadCount: 0 } : c
            ));
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        }
    };

    const fetchMessages = async (partnerId: number) => {
        try {
            console.log(`💬 Fetching messages with partner ${partnerId}...`);
            const response = await chatAPI.getMessages(partnerId);
            console.log('📥 Messages response:', response.data);
            setMessages(response.data);
            if (response.data.length > 0) {
                setLastMessageId(response.data[response.data.length - 1].id);
            }
            console.log(`✅ Loaded ${response.data.length} message(s)`);
            
            // Refetch unread count immediately after opening chat
            await fetchUnreadCount();
            
            // Trigger NotificationBell to refetch unread count
            window.dispatchEvent(new Event('chatMessagesRead'));
        } catch (error) {
            console.error('❌ Failed to fetch messages', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedPartner) return;

        const tempMsg = newMessage;
        setNewMessage(''); // Optimistic clear

        try {
            await chatAPI.sendMessage(selectedPartner.id, tempMsg);
            
            // Add partner to conversations if not already there
            setConversations(prev => {
                if (prev.some(c => c.id === selectedPartner.id)) {
                    return prev;
                }
                return [{
                    ...selectedPartner,
                    unreadCount: 0,
                    lastMessage: tempMsg,
                    lastMessageTime: new Date().toISOString()
                }, ...prev];
            });
            
            await fetchMessages(selectedPartner.id); // Refresh messages
            await fetchUnreadCount(); // Update unread count immediately
        } catch (error) {
            console.error('Failed to send message', error);
            setNewMessage(tempMsg); // Restore on error
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
            {/* Sidebar List */}
            <div className={`${isMobileListVisible ? 'w-full' : 'hidden'} md:flex md:w-80 flex-col border-r border-slate-100 bg-slate-50/50`}>
                <div className="p-4 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Pesan</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Cari..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {loading && conversations.length === 0 ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3">
                                <LoadingSkeleton className="w-12 h-12 rounded-full" />
                                <div className="flex-1">
                                    <LoadingSkeleton className="h-4 w-3/4 mb-2" />
                                    <LoadingSkeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">
                            Belum ada percakapan.
                            <br />
                            Kirim pesan dari Dashboard untuk memulai.
                        </div>
                    ) : (() => {
                        // Combine conversations with selectedPartner if it's not in conversations list
                        let displayConversations = [...(conversations || [])];
                        if (selectedPartner && !displayConversations.some(c => c.id === selectedPartner.id)) {
                            displayConversations.unshift(selectedPartner);
                        }
                        
                        const filteredConversations = displayConversations.filter((p: User) => {
                            if (!p || !p.name) return false;
                            return p.name.toLowerCase().includes(searchTerm.toLowerCase());
                        });
                        return filteredConversations.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-sm">
                                Tidak ditemukan "{searchTerm}"
                            </div>
                        ) : (
                            filteredConversations.map((partner: User) => (
                                <div
                                    key={partner.id}
                                    onClick={() => {
                                        setSelectedPartner(partner);
                                        setUserSelectedPartnerId(partner.id);
                                        setIsMobileListVisible(false);
                                    }}
                                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${selectedPartner?.id === partner.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'hover:bg-white hover:shadow-md text-slate-700'
                                        }`}
                                >
                                    <div className="relative">
                                        <img
                                            src={partner.photoUrl || `https://ui-avatars.com/api/?name=${partner.name}&background=random`}
                                            alt={partner.name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                        {/* Online Status (Simulation) */}
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className={`font-semibold text-sm truncate ${selectedPartner?.id === partner.id ? 'text-white' : 'text-slate-800'}`}>
                                                {partner.name}
                                            </h3>
                                            {partner.lastMessageTime && (
                                                <span className={`text-[10px] ${selectedPartner?.id === partner.id ? 'text-blue-100' : 'text-slate-400'}`}>
                                                    {formatTime(partner.lastMessageTime)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className={`text-xs truncate max-w-[140px] ${selectedPartner?.id === partner.id ? 'text-blue-100' : 'text-slate-500'}`}>
                                                {partner.lastMessage || 'Mulai percakapan...'}
                                            </p>
                                            {partner.unreadCount && partner.unreadCount > 0 ? (
                                                <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                                                    {partner.unreadCount}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            ))
                        );
                    })()}
                </div>
            </div>

            {/* Chat Area */}
            {selectedPartner ? (
                <div className={`${!isMobileListVisible ? 'w-full' : 'hidden'} md:flex flex-1 flex-col bg-[#F8FAFC] relative`}>
                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsMobileListVisible(true)}
                                className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <img
                                src={selectedPartner.photoUrl || `https://ui-avatars.com/api/?name=${selectedPartner.name}&background=random`}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                            <div>
                                <h3 className="font-bold text-slate-800">{selectedPartner.name}</h3>
                                <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    Online
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400">
                            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Phone size={20} /></button>
                            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Video size={20} /></button>
                            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><MoreVertical size={20} /></button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-1 scroll-smooth">
                        {messages.map((msg, idx) => {
                            const isMe = msg.senderId === user?.id;
                            // Show avatar only on the last message from that sender
                            const showAvatar = !isMe && (idx === messages.length - 1 || messages[idx + 1].senderId !== msg.senderId);

                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start items-start gap-2'}`}>
                                    {!isMe && (
                                        <>
                                            {showAvatar ? (
                                                <img
                                                    src={selectedPartner.photoUrl || `https://ui-avatars.com/api/?name=${selectedPartner.name}&background=random`}
                                                    className="w-8 h-8 rounded-full border border-slate-200 flex-shrink-0 mt-0.5"
                                                />
                                            ) : (
                                                <div className="w-8 flex-shrink-0"></div>
                                            )}
                                        </>
                                    )}

                                    <div className={`max-w-[70%] sm:max-w-[60%] space-y-1 flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                                        <div
                                            className={`text-sm px-4 py-2.5 rounded-2xl shadow-sm relative ${isMe
                                                ? 'bg-blue-600 text-white rounded-br-sm'
                                                : 'bg-white text-slate-700 rounded-bl-sm border border-slate-100'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                        <span className="text-[10px] text-slate-400 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {formatTime(msg.createdAt)}
                                            {isMe && (
                                                <span className="ml-1">
                                                    {msg.isRead ? '• Dibaca' : '• Terkirim'}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 space-y-3">
                        <div className="flex items-end gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                            <button type="button" className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                                <Paperclip size={20} />
                            </button>

                            <textarea
                                value={newMessage}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
                                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 text-sm max-h-32 min-h-[44px] py-3 resize-none custom-scrollbar"
                                placeholder="Ketik pesan..."
                                rows={1}
                            />

                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transition-all mb-0.5"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50 text-slate-400">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <MessageSquare size={48} className="text-blue-500" />
                    </div>
                    <p className="text-lg font-medium text-slate-600">Pilih percakapan untuk memulai chat</p>
                    <p className="text-sm mt-2">Kirim pesan dan konsultasi dengan dokter/pasien Anda</p>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
