import React from 'react';
import { Button } from './Button';
import { TRANSLATIONS, MATCH_QUOTES, IntentDescriptions } from '../constants';
import type { Language, UserProfile } from '../types';

const MatchPopup = ({ 
    user, 
    matchUser, 
    onClose, 
    onChat, 
    lang 
}: { 
    user: UserProfile, 
    matchUser: UserProfile, 
    onClose: () => void, 
    onChat: () => void, 
    lang: Language 
}) => {
    const userIntent = IntentDescriptions[user.intent];
    const matchIntent = IntentDescriptions[matchUser.intent];
    const UserFIcon = userIntent.icon;
    const MatchFIcon = matchIntent.icon;
    const quote = MATCH_QUOTES[Math.floor(Math.random() * MATCH_QUOTES.length)][lang];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
             <div className="absolute inset-0 pointer-events-none overflow-hidden">
                 {[...Array(20)].map((_, i) => (
                     <div key={i} className="absolute w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{
                         top: `${Math.random() * 100}%`,
                         left: `${Math.random() * 100}%`,
                         animationDelay: `${Math.random() * 2}s`
                     }}></div>
                 ))}
             </div>

             <div className="w-full max-w-sm bg-gradient-to-b from-white to-pink-50 rounded-[2rem] p-8 text-center shadow-2xl transform scale-100 animate-fade-in-up relative border border-white/20">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600 italic tracking-tighter transform -rotate-2 mb-8">
                    {TRANSLATIONS[lang].new_match}
                </h2>
                
                <div className="flex justify-center items-center mb-8 relative h-32">
                    <div className="absolute left-4 transform -rotate-12 hover:rotate-0 transition-transform duration-500 z-10">
                        <div className="relative">
                            <img src={user.photos[0]} className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover" />
                             <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${userIntent.color} text-white flex items-center justify-center border-2 border-white`}>
                                <div className="w-4 h-4"><UserFIcon /></div>
                             </div>
                        </div>
                    </div>

                    <div className="absolute right-4 transform rotate-12 hover:rotate-0 transition-transform duration-500 z-20">
                        <div className="relative">
                            <img src={matchUser.photos[0]} className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover" />
                            <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${matchIntent.color} text-white flex items-center justify-center border-2 border-white`}>
                                <div className="w-4 h-4"><MatchFIcon /></div>
                             </div>
                        </div>
                    </div>
                </div>

                <p className="text-gray-600 font-medium italic mb-8">"{quote}"</p>

                <div className="space-y-3">
                    <Button onClick={onChat} fullWidth className="text-lg">
                        {TRANSLATIONS[lang].send_message}
                    </Button>
                    <Button onClick={onClose} variant="ghost" fullWidth className="text-gray-500">
                        {TRANSLATIONS[lang].keep_swiping}
                    </Button>
                </div>
             </div>
        </div>
    );
};

export default MatchPopup;