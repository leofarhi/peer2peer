import React from 'react';
import { TRANSLATIONS } from '../constants';
import type { Language } from '../types';

const BannedScreen = ({ onLogout, lang }: { onLogout: () => void, lang: Language }) => {
    return (
        <div className="h-screen w-full bg-red-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mb-8 shadow-lg">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-red-600">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-red-900 mb-4 tracking-tight">
                {TRANSLATIONS[lang].banned_title}
            </h1>
            
            <p className="text-gray-700 text-lg max-w-md mx-auto mb-10 leading-relaxed">
                {TRANSLATIONS[lang].banned_desc}
            </p>
            
            <button 
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95"
            >
                {TRANSLATIONS[lang].banned_btn}
            </button>
        </div>
    );
};

export default BannedScreen;