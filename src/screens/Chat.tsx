import React, { useState, useRef, useEffect } from 'react';
import { ICEBREAKER_QUESTIONS, IntentDescriptions, TRANSLATIONS } from '../constants';
import type { Language, Match, Message, UserProfile } from '../types';
import { getSession } from '../services/authService';
import { socketService } from '../services/socket';
import { BASE_URL } from '../constants';

const Chat = ({ 
    match, 
    onBack, 
    sendMessage, 
    isDesktop,
    lang,
    onViewProfile
}: { 
    match: Match; 
    onBack: () => void; 
    sendMessage: (text: string) => void;
    isDesktop: boolean;
    lang: Language;
    onViewProfile: (u: UserProfile) => void
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPartnerOnline, setIsPartnerOnline] = useState(match.user.isOnline);

    const [icebreakers] = useState(() => {
        const shuffled = [...ICEBREAKER_QUESTIONS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 2);
    });

    const session = getSession();

    const markAsRead = async () => {
        if (!session.token) return;
        try {
            await fetch(`${BASE_URL}/api/matches/${match.id}/messages`, {
                headers: { 'Authorization': `Bearer ${session.token}` }
            });
        } catch (e) { console.error("Error marking read", e); }
    };

    const fetchMessages = async () => {
        if (!session.token) return;
        try {
            const res = await fetch(`${BASE_URL}/api/matches/${match.id}/messages`, {
                headers: { 'Authorization': `Bearer ${session.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        setIsPartnerOnline(match.user.isOnline);

        const handleNewMessage = (data: any) => {
            if (data.matchId === match.id) {
                setMessages(prev => {
                    if (prev.some(m => m.id === data.id)) return prev;
                    return [...prev, {
                        id: data.id,
                        senderId: data.senderId === session.currentUser?.id ? 'me' : data.senderId,
                        text: data.text,
                        timestamp: data.timestamp
                    }];
                });

                // Si la fenêtre a le focus, on marque lu immédiatement
                if (document.hasFocus()) {
                    markAsRead();
                }
            }
        };

        const handleStatusChange = (data: any) => {
            if (data.userId === match.user.id) {
                setIsPartnerOnline(data.isOnline);
            }
        };

        // Fonction pour gérer le retour sur l'onglet/fenêtre
        const handleFocusOrVisibility = () => {
            if (document.hasFocus() && document.visibilityState === 'visible') {
                markAsRead();
            }
        };

        socketService.on('message', handleNewMessage);
        socketService.on('user_status', handleStatusChange);
        
        // On écoute les deux pour être sûr
        window.addEventListener('focus', handleFocusOrVisibility);
        document.addEventListener('visibilitychange', handleFocusOrVisibility);

        return () => {
            socketService.off('message', handleNewMessage);
            socketService.off('user_status', handleStatusChange);
            window.removeEventListener('focus', handleFocusOrVisibility);
            document.removeEventListener('visibilitychange', handleFocusOrVisibility);
        };
    }, [match.id, match.user.id]); 

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text: string = input) => {
        if (!text.trim() || !session.token) return;

        const tempId = Date.now().toString();
        const newMsg: Message = {
            id: tempId,
            senderId: 'me',
            text: text,
            timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, newMsg]);
        setInput("");
        sendMessage(text);

        try {
            await fetch(`${BASE_URL}/api/matches/${match.id}/messages`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${session.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
        } catch (e) { console.error("Erreur envoi", e); }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            <div className="p-4 border-b flex items-center bg-white shadow-sm shrink-0 z-10">
                <button 
                    onClick={onBack} 
                    className={`mr-4 text-gray-600 p-2 -ml-2 hover:bg-gray-100 rounded-full ${!isDesktop ? 'block' : 'hidden'}`}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" /></svg>
                </button>
                <div 
                    className="relative flex items-center cursor-pointer hover:bg-gray-50 rounded-lg p-1 pr-3 transition-colors -my-1"
                    onClick={() => onViewProfile(match.user)}
                >
                     <div className="relative mr-3">
                        <img src={match.user.photos[0]} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isPartnerOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                     </div>
                     <div>
                        <h3 className="font-bold text-gray-800">{match.user.name}</h3>
                        <p className="text-xs text-gray-500 capitalize">
                            {IntentDescriptions[match.user.intent].label[lang]} • {isPartnerOnline ? <span className="text-green-600 font-bold">Online</span> : 'Offline'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {!isLoading && messages.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full opacity-100 animate-fade-in">
                         <div className="w-24 h-24 bg-gray-100 rounded-full mb-4 flex items-center justify-center text-4xl animate-bounce">👋</div>
                         <p className="font-bold text-gray-800 mb-2">{TRANSLATIONS[lang].say_hello}</p>
                         <p className="text-sm text-gray-400 mb-8">{TRANSLATIONS[lang].dont_be_shy}</p>
                         
                         <div className="flex flex-col gap-3 w-full max-w-sm">
                             {icebreakers.map((q, i) => (
                                 <button
                                    key={i}
                                    onClick={() => handleSend(q[lang])}
                                    className="bg-white border-2 border-pink-100 hover:border-pink-400 hover:bg-pink-50 text-gray-700 py-3 px-4 rounded-xl text-sm font-bold shadow-sm transition-all transform hover:scale-105"
                                 >
                                     {q[lang]}
                                 </button>
                             ))}
                         </div>
                     </div>
                )}
                
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-[85%] lg:max-w-[70%] p-3 px-5 rounded-2xl shadow-sm text-sm lg:text-base ${msg.senderId === 'me' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-sm' : 'bg-pink-50 text-gray-800 border border-pink-100 rounded-bl-sm'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-white flex items-center gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={TRANSLATIONS[lang].type_message}
                    className="text-gray-800 flex-1 bg-gray-100 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-shadow"
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button onClick={() => handleSend()} disabled={!input.trim()} className="bg-pink-500 text-white p-3 rounded-full hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 lg:w-6 lg:h-6"><path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" /></svg>
                </button>
            </div>
        </div>
    );
};

export default Chat;