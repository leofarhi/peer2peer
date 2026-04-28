import React, { useState } from 'react';
import { Button } from '../components/Button';
import { TRANSLATIONS } from '../constants';
import { getSession } from '../services/authService';
import type { Language } from '../types';
import { BASE_URL } from './constants';

const ContactScreen = ({ onBack, lang }: { onBack: () => void, lang: Language }) => {
    const session = getSession();
    const [email, setEmail] = useState(session.currentUser?.email || ""); // Pré-rempli si connecté
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !message) return;

        setStatus('sending');
        try {
            await fetch(`${BASE_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': session.token ? `Bearer ${session.token}` : ''
                },
                body: JSON.stringify({ email, message })
            });
            setStatus('success');
            setTimeout(onBack, 2000); // Retour auto après 2s
        } catch (error) {
            console.error(error);
            setStatus('idle');
            alert("Error sending message");
        }
    };

    if (status === 'success') {
        return (
            <div className="h-full w-full bg-white flex flex-col items-center justify-center p-6 animate-fade-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-500 text-4xl">
                    ✓
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{TRANSLATIONS[lang].contact_success}</h2>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-gray-50 flex flex-col animate-fade-in">
            {/* Header simple */}
            <div className="bg-white p-4 shadow-sm flex items-center">
                <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-bold px-2">
                    ← {TRANSLATIONS[lang].contact_back}
                </button>
                <h1 className="flex-1 text-center font-bold text-lg text-gray-800">{TRANSLATIONS[lang].contact_title}</h1>
                <div className="w-10"></div> {/* Spacer pour centrer le titre */}
            </div>

            <div className="flex-1 p-6 md:p-10 flex flex-col items-center">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <p className="text-gray-500 mb-6 text-center">{TRANSLATIONS[lang].contact_desc}</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{TRANSLATIONS[lang].contact_email_label}</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none"
                                placeholder="student@42.fr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{TRANSLATIONS[lang].contact_msg_label}</label>
                            <textarea 
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                            />
                        </div>
                        <Button 
                            type="submit" 
                            fullWidth 
                            variant="primary" 
                            disabled={status === 'sending'}
                        >
                            {status === 'sending' ? '...' : TRANSLATIONS[lang].contact_send}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactScreen;