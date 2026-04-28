import React from 'react';
import { Icons } from '../constants';
import { AppView } from '../types';

interface MobileNavProps {
  currentView: AppView;
  totalNotifications: number;
  onNavigate: (view: AppView) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, totalNotifications, onNavigate }) => {
  if (currentView === AppView.CHAT) return null;

  return (
    <div className="lg:hidden bg-white border-t h-16 shrink-0 flex items-center justify-around z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
        <button 
            onClick={() => onNavigate(AppView.DISCOVERY)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${currentView === AppView.DISCOVERY ? 'text-pink-500' : 'text-gray-300'}`}
        >
            <div className="w-7 h-7"><Icons.Logo /></div>
        </button>
        <button 
            onClick={() => onNavigate(AppView.MATCHES)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${currentView === AppView.MATCHES ? 'text-pink-500' : 'text-gray-300'}`}
        >
            <div className="relative">
                <div className="w-7 h-7"><Icons.Chat /></div>
                {totalNotifications > 0 && (
                    <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 min-w-[1rem] px-1 rounded-full flex items-center justify-center border border-white shadow-sm">
                        {totalNotifications}
                    </div>
                )}
            </div>
        </button>
        <button 
            onClick={() => onNavigate(AppView.PROFILE)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${currentView === AppView.PROFILE ? 'text-pink-500' : 'text-gray-300'}`}
        >
            <div className="w-7 h-7"><Icons.User /></div>
        </button>
    </div>
  );
};

export default MobileNav;