import React from 'react';
import { IntentDescriptions, TRANSLATIONS } from '../constants';
import type { Language, Match, UserProfile } from '../types';

const MatchesList = ({ 
    matches, 
    onSelectMatch, 
    activeMatchId, 
    lang,
    onViewProfile
}: { 
    matches: Match[], 
    onSelectMatch: (m: Match) => void, 
    activeMatchId?: string, 
    lang: Language,
    onViewProfile: (u: UserProfile) => void
}) => {
    if (matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
                <div className="text-5xl mb-4 opacity-30 grayscale">🌍</div>
                <h3 className="text-lg font-bold text-gray-600">{TRANSLATIONS[lang].no_matches}</h3>
                <p className="text-sm">{TRANSLATIONS[lang].swipe_more}</p>
            </div>
        );
    }
    return (
        <div className="p-4 space-y-2 h-full overflow-y-auto">
            {matches.map(match => {
                const intentInfo = IntentDescriptions[match.user.intent];
                const FIcon = intentInfo.icon;
                const isActive = activeMatchId === match.id;
                
                return (
                    <div 
                        key={match.id} 
                        onClick={() => onSelectMatch(match)} 
                        className={`flex items-center p-3 rounded-2xl cursor-pointer transition-all ${isActive ? 'bg-pink-50 border-pink-200 shadow-sm' : 'hover:bg-gray-50 border-transparent'} border relative`}
                    >
                        <div 
                            className="relative shrink-0 group"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewProfile(match.user);
                            }}
                        >
                            <img src={match.user.photos[0]} alt={match.user.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform" />
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${intentInfo.color} text-white flex items-center justify-center border-2 border-white`}>
                                <div className="w-3 h-3"><FIcon /></div>
                            </div>
                            
                            {match.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 min-w-[1.25rem] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10">
                                    {match.unreadCount}
                                </div>
                            )}
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                                <h3 className={`font-bold truncate ${isActive ? 'text-pink-700' : 'text-gray-800'}`}>{match.user.name}</h3>
                                {match.unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-pink-500"></span>}
                            </div>
                            <p className={`text-xs truncate ${match.unreadCount > 0 ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>{match.lastMessage || `Matched just now`}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MatchesList;