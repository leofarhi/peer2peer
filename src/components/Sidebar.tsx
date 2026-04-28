import React from 'react';
import MatchesList from '../screens/MatchesList';
import { TRANSLATIONS, Icons } from '../constants';
import { AppView } from '../types';
import type { UserProfile, Match, Language } from '../types';

interface SidebarProps {
  currentUser: UserProfile;
  matches: Match[];
  activeMatchId?: string;
  totalNotifications: number;
  lang: Language;
  onNavigate: (view: AppView) => void;
  onSelectMatch: (m: Match) => void;
  onViewProfile: (u: UserProfile) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentUser, matches, activeMatchId, totalNotifications, lang, onNavigate, onSelectMatch, onViewProfile 
}) => {
  return (
    <aside className="hidden lg:flex flex-col w-[26rem] bg-white border-r border-gray-200 h-full shadow-sm z-20">
        <div className="h-20 bg-gradient-to-r from-pink-500 to-rose-600 shrink-0 flex items-center px-4 justify-between text-white shadow-md">
            <div 
                className="flex items-center cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-all"
                onClick={() => onNavigate(AppView.PROFILE)}
            >
                <img src={currentUser.photos[0]} className="w-10 h-10 rounded-full border-2 border-white mr-3 object-cover" />
                <span className="font-bold text-lg">{currentUser.name}</span>
            </div>
            <button 
                onClick={() => onNavigate(AppView.DISCOVERY)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
                title="Back to Discovery"
            >
                <div className="w-8 h-8"><Icons.Logo /></div>
            </button>
        </div>

        <div className="flex-1 overflow-hidden bg-white flex flex-col">
             <div className="p-4 pb-2 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{TRANSLATIONS[lang].nav_messages}</h3>
                {totalNotifications > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{totalNotifications}</span>
                )}
             </div>
             <div className="flex-1 overflow-y-auto">
                <MatchesList 
                    matches={matches} 
                    activeMatchId={activeMatchId}
                    onSelectMatch={onSelectMatch} 
                    lang={lang}
                    onViewProfile={onViewProfile}
                />
             </div>
        </div>
    </aside>
  );
};

export default Sidebar;