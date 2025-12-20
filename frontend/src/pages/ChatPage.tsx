import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Phone, Video, MoreVertical, ArrowLeft, Image as ImageIcon, Paperclip, MessageSquare } from 'lucide-react';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
    const [conversations, setConversations] = useState<User[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch conversations
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Poll conversations list
        return () => clearInterval(interval);
    }, []);

    // Fetch messages when partner selected
    useEffect(() => {
        if (selectedPartner) {
            fetchMessages(selectedPartner.id);
            setIsMobileListVisible(false);
            const interval = setInterval(() => fetchMessages(selectedPartner.id), 3000); // Fast poll for chat
            return () => clearInterval(interval);
        }
    }, [selectedPartner]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const response = await chatAPI.getConversations();
            setConversations(response.data);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        }
    };

    const fetchMessages = async (partnerId: number) => {
        try {
            const response = await chatAPI.getMessages(partnerId);
            setMessages(response.data);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedPartner) return;

        const tempMsg = newMessage;
        setNewMessage(''); // Optimistic clear

        try {
            await chatAPI.sendMessage(selectedPartner.id, tempMsg);
            await fetchMessages(selectedPartner.id); // Refresh immediately
            // Also refresh convos to update last message
            fetchConversations();
        } catch (error) {
            console.error('Failed to send message', error);
            setNewMessage(tempMsg); // Restore on error
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
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
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {conversations.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">
                            Belum ada percakapan.
                            <br />
                            Selesaikan Appointment untuk memulai chat.
                        </div>
                    ) : (
                        conversations.map(partner => (
                            <div
                                key={partner.id}
                                onClick={() => setSelectedPartner(partner)}
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
                                                {new Date(partner.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    )}
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
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                        {messages.map((msg, idx) => {
                            const isMe = msg.senderId === user?.id;
                            const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId);

                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group items-end gap-2`}>
                                    {!isMe && (
                                        <div className="w-8 flex-shrink-0">
                                            {showAvatar && (
                                                <img
                                                    src={selectedPartner.photoUrl || `https://ui-avatars.com/api/?name=${selectedPartner.name}&background=random`}
                                                    className="w-8 h-8 rounded-full border border-slate-200"
                                                />
                                            )}
                                        </div>
                                    )}

                                    <div className={`max-w-[70%] sm:max-w-[60%] space-y-1 ${isMe ? 'items-end flex flex-col' : 'items-start'}`}>
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
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
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
