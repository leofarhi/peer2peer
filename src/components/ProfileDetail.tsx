import React, { useState } from 'react';
import { IntentDescriptions, TRANSLATIONS } from '../constants';
import type { Language, UserProfile } from '../types';

interface ProfileDetailProps {
    user: UserProfile;
    onClose: () => void;
    onLike?: () => void;
    onPass?: () => void;
    lang: Language;
    isMatchView?: boolean;
    // NOUVEAUX HANDLERS (Optionnels)
    onBlock?: (userId: string) => void;
    onReport?: (userId: string, reason: string) => void;
}

const ProfileDetail = ({ 
    user, 
    onClose, 
    onLike, 
    onPass, 
    lang,
    isMatchView = false,
    onBlock,
    onReport
}: ProfileDetailProps) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const intentInfo = IntentDescriptions[user.intent];
    const FIcon = intentInfo.icon;

    const nextPhoto = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentPhotoIndex((prev) => (prev + 1) % user.photos.length);
    };

    const prevPhoto = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentPhotoIndex((prev) => (prev - 1 + user.photos.length) % user.photos.length);
    };

    // Handlers Modération
    const handleReportClick = () => {
        if (onReport) {
            const reason = window.prompt("Why do you want to report this user? (Harassment, inappropriate content...)");
            if (reason && reason.trim()) {
                onReport(user.id, reason);
                alert("User reported. Thank you for making Peer2Peer safer.");
                onClose();
            }
        }
    };

    const handleBlockClick = () => {
        if (onBlock) {
            if (window.confirm(`Are you sure you want to block ${user.name}? This will remove them from your matches and discovery.`)) {
                onBlock(user.id);
                onClose();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col lg:flex-row animate-fade-in sm:overflow-hidden">
            
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 z-50 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-md transition-colors shadow-sm"
            >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>
            </button>

            <div className="order-2 lg:order-1 flex-1 bg-white flex flex-col h-1/2 lg:h-full lg:w-1/2 relative z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] lg:shadow-none border-t lg:border-t-0 lg:border-r border-gray-100">
                 <div className="flex-1 overflow-y-auto p-6 pb-32 no-scrollbar">
                    <div className="mb-6 mt-2 lg:mt-10">
                        <div className="flex items-baseline mb-2">
                            <h2 className="text-3xl lg:text-6xl font-extrabold mr-3 text-gray-900 tracking-tight">{user.name}</h2>
                            <span className="text-2xl lg:text-4xl font-medium text-gray-400">{user.age} {TRANSLATIONS[lang].years_old}</span>
                        </div>
                        <p className="text-gray-500 flex items-center font-medium text-sm lg:text-lg">
                             <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded mr-2 text-xs lg:text-sm font-bold uppercase tracking-wider">{user.campus}</span>
                             <span className="mr-2 text-gray-300">•</span>
                             <span className="text-gray-600">{user.intraLogin}</span>
                        </p>
                    </div>

                    <div className="flex items-center mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br ${intentInfo.color} text-white flex items-center justify-center mr-4 shadow-md shrink-0`}>
                            <div className="w-6 h-6 lg:w-8 lg:h-8"><FIcon /></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg lg:text-2xl">{intentInfo.label[lang]}</h3>
                            <p className="text-sm lg:text-base text-gray-500 mb-0.5">{intentInfo.desc[lang]}</p>
                            <p className="text-xs lg:text-sm text-pink-600 font-bold uppercase">{intentInfo.concrete[lang]}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-3">{TRANSLATIONS[lang].my_bio}</h4>
                        <p className="text-gray-700 leading-relaxed text-base lg:text-xl italic">
                            "{user.bio}"
                        </p>
                    </div>

                    {/* --- ZONE MODÉRATION (Ajouté ici, discret en bas) --- */}
                    {(onBlock || onReport) && (
                         <div className="pt-8 mt-8 border-t border-gray-100 flex flex-col gap-3">
                             {onReport && (
                                 <button onClick={handleReportClick} className="text-gray-400 hover:text-orange-500 text-sm font-bold uppercase tracking-wide py-2 transition-colors text-left">
                                     🚨 Report {user.name}
                                 </button>
                             )}
                             {onBlock && (
                                 <button onClick={handleBlockClick} className="text-gray-400 hover:text-red-600 text-sm font-bold uppercase tracking-wide py-2 transition-colors text-left">
                                     🚫 Block {user.name}
                                 </button>
                             )}
                         </div>
                     )}
                 </div>

                 {!isMatchView && onLike && onPass && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white via-white to-transparent pt-12 pb-8 flex justify-center items-center gap-10 z-20 pointer-events-none">
                     <button 
                        onClick={onPass}
                        className="pointer-events-auto w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white shadow-xl text-rose-500 flex items-center justify-center text-3xl border border-gray-100 hover:bg-rose-50 transition-transform active:scale-95 hover:scale-110"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 lg:w-10 lg:h-10"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>
                    </button>
                    <button 
                        onClick={onLike}
                        className="pointer-events-auto w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-xl shadow-teal-500/30 text-white flex items-center justify-center text-3xl hover:shadow-2xl transition-transform active:scale-95 hover:scale-110"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 lg:w-10 lg:h-10"><path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" /></svg>
                    </button>
                  </div>
                 )}
            </div>

            <div className="order-1 lg:order-2 h-1/2 lg:h-full lg:w-1/2 relative bg-gray-900 overflow-hidden group select-none">
                <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                     <div 
                        className="absolute inset-0 bg-cover bg-center blur-2xl opacity-50 scale-110 transition-all duration-500"
                        style={{ backgroundImage: `url(${user.photos[currentPhotoIndex]})` }}
                     ></div>
                     
                     <img 
                        src={user.photos[currentPhotoIndex]} 
                        className="relative w-full h-full object-contain z-10 transition-opacity duration-300" 
                        key={currentPhotoIndex}
                        alt="User gallery"
                     />
                     
                     <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent lg:hidden pointer-events-none z-20"></div>
                </div>

                <button 
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/10 hover:bg-black/40 text-white p-3 rounded-full backdrop-blur-md transition-colors z-30 outline-none"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                </button>
                <button 
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/10 hover:bg-black/40 text-white p-3 rounded-full backdrop-blur-md transition-colors z-30 outline-none"
                >
                     <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                </button>

                <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2 z-30">
                    {user.photos.map((_, idx) => (
                        <div 
                            key={idx}
                            className={`h-2 rounded-full transition-all duration-300 shadow-sm ${idx === currentPhotoIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfileDetail;