import React, { useState, useRef, useEffect } from 'react';
import ProfileDetail from '../components/ProfileDetail';
import { IntentDescriptions, TRANSLATIONS } from '../constants';
import type { Language, UserProfile } from '../types';

const Discovery = ({ 
  user, 
  users, 
  onSwipe, 
  lang
}: { 
  user: UserProfile; 
  users: UserProfile[]; 
  onSwipe: (u: UserProfile, direction: 'left' | 'right') => void; 
  lang: Language;
}) => {
  const [lastDirection, setLastDirection] = useState<string | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const startXRef = useRef(0);
  const dragStartTimeRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // --- BLOCAGE MINEUR ---
  if (user.age < 18) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 m-4 animate-fade-in">
           <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
           </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{TRANSLATIONS[lang].underage_block_title}</h2>
          <p className="text-gray-500 max-w-xs mx-auto">{TRANSLATIONS[lang].underage_block_desc}</p>
        </div>
      );
  }

  if (user.dailyQuota <= 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 m-4 animate-fade-in">
           <div className="w-24 h-24 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mb-6">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                  <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
           </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{TRANSLATIONS[lang].quota_reached_title}</h2>
          <p className="text-gray-500 max-w-xs mx-auto">{TRANSLATIONS[lang].quota_reached_desc}</p>
        </div>
      );
  }

  const currentUser = users.length > 0 ? users[0] : null;
  const nextUser = users.length > 1 ? users[1] : null;

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentUser) return;
    setLastDirection(direction);
    setDragX(0);
    
    setTimeout(() => {
        onSwipe(currentUser, direction);
        setLastDirection(null);
        setShowDetail(false);
    }, 300);
  };

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!currentUser) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    startXRef.current = clientX;
    dragStartTimeRef.current = Date.now();
  };

  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const delta = clientX - startXRef.current;
    setDragX(delta);
  };

  const onDragEnd = () => {
    setIsDragging(false);
    const diffTime = Date.now() - dragStartTimeRef.current;
    const threshold = 120;
    
    if (diffTime < 200 && Math.abs(dragX) < 10) {
        setShowDetail(true);
        setDragX(0);
        return;
    }

    if (dragX > threshold) {
      handleSwipe('right');
    } else if (dragX < -threshold) {
      handleSwipe('left');
    } else {
      setDragX(0);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 m-4 animate-fade-in">
         <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <span className="text-4xl grayscale opacity-50">👻</span>
         </div>
        <h2 className="text-2xl font-bold text-gray-800">{TRANSLATIONS[lang].no_more_users}</h2>
        <p className="text-gray-500 mt-2 max-w-xs mx-auto">{TRANSLATIONS[lang].no_more_desc}</p>
      </div>
    );
  }

  const intentInfo = IntentDescriptions[currentUser.intent];
  const IntentIcon = intentInfo.icon;

  const rotateDeg = dragX * 0.05;
  const opacityNope = Math.min(Math.max(dragX * -0.01, 0), 1);
  const opacityLike = Math.min(Math.max(dragX * 0.01, 0), 1);

  const cardStyle = isDragging ? {
    transform: `translateX(${dragX}px) rotate(${rotateDeg}deg)`,
    transition: 'none',
    cursor: 'grabbing'
  } : {};

  // MODIFICATION : Plus de 'flex-1' ici, mais 'absolute inset-0'
  const getCardClasses = () => {
      const base = "absolute inset-0 w-full h-full rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-xl bg-white transform touch-none z-10";
      if (isDragging) return base;
      if (lastDirection === 'left') {
          return `${base} -translate-x-[150%] rotate-[-15deg] opacity-0 transition-all duration-300 ease-out`;
      }
      if (lastDirection === 'right') {
          return `${base} translate-x-[150%] rotate-[15deg] opacity-0 transition-all duration-300 ease-out`;
      }
      return `${base}`;
  };

  return (
    <div className="h-full w-full relative flex flex-col p-2 lg:p-8 lg:max-w-3xl mx-auto select-none">
      
      {showDetail && (
          <ProfileDetail 
             user={currentUser} 
             onClose={() => setShowDetail(false)}
             onLike={() => handleSwipe('right')}
             onPass={() => handleSwipe('left')}
             lang={lang}
          />
      )}

      {/* --- WRAPPER DES CARTES (Prend toute la place dispo au dessus des boutons) --- */}
      <div className="flex-1 relative w-full h-full">
          
          {/* --- CARTE SUIVANTE (Background) --- */}
          {nextUser && (
              <div className="absolute inset-0 z-0 pointer-events-none transform scale-95 opacity-50 translate-y-4">
                  <div className="w-full h-full rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden bg-gray-100 shadow-lg">
                      <img src={nextUser.photos[0]} className="w-full h-full object-cover" />
                  </div>
              </div>
          )}

          {/* --- CARTE ACTUELLE (Foreground) --- */}
          <div 
            key={currentUser.id}
            ref={cardRef}
            className={getCardClasses()}
            style={isDragging ? cardStyle : undefined}
            onMouseDown={onDragStart}
            onMouseMove={onDragMove}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
            onTouchStart={onDragStart}
            onTouchMove={onDragMove}
            onTouchEnd={onDragEnd}
          >
            <img 
              src={currentUser.photos[0]} 
              alt={currentUser.name} 
              className="w-full h-full object-cover pointer-events-none"
            />
            
            <div className="absolute top-10 right-10 border-4 border-green-500 rounded-lg p-2 px-4 transform rotate-[15deg] pointer-events-none z-20" style={{ opacity: opacityLike }}>
                <span className="text-4xl font-extrabold text-green-500 uppercase tracking-widest">LIKE</span>
            </div>
            <div className="absolute top-10 left-10 border-4 border-red-500 rounded-lg p-2 px-4 transform rotate-[-15deg] pointer-events-none z-20" style={{ opacity: opacityNope }}>
                <span className="text-4xl font-extrabold text-red-500 uppercase tracking-widest">NOPE</span>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5 lg:p-10 text-white pointer-events-none">
                <div className="absolute top-4 right-4 lg:top-6 lg:right-6 flex flex-col items-end gap-2">
                    <div className="bg-black/40 backdrop-blur-md px-3 py-1 lg:px-4 lg:py-1.5 rounded-full text-xs lg:text-sm font-bold border border-white/20 flex items-center">
                        <span className="mr-1">📷</span> {currentUser.photos.length}
                    </div>
                </div>

                <div className="transform transition-transform translate-y-0">
                    <div className="flex items-baseline mb-1 lg:mb-2">
                        <h2 className="text-3xl lg:text-5xl font-extrabold mr-3 tracking-tight">{currentUser.name}</h2>
                        <span className="text-xl lg:text-3xl font-medium opacity-90">{currentUser.age} {TRANSLATIONS[lang].years_old}</span>
                    </div>
                    
                    <p className="text-gray-200 mb-3 flex items-center text-sm lg:text-lg font-medium">
                        <span className="mr-2">📍</span> {currentUser.campus} • {currentUser.intraLogin}
                    </p>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 lg:p-4 mb-4 border border-white/10">
                        <p className="text-sm lg:text-base italic leading-relaxed line-clamp-2 lg:line-clamp-none">"{currentUser.bio}"</p>
                    </div>
                    
                    <div className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 lg:px-4 lg:py-2 border border-white/20">
                        <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center bg-gradient-to-br ${intentInfo.color} mr-2 lg:mr-3`}>
                            <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white"><IntentIcon /></div>
                        </div>
                        <span className="font-bold text-xs lg:text-sm tracking-wide">{intentInfo.desc[lang]}</span>
                    </div>
                    
                    <p className="text-xs text-center mt-4 opacity-70 uppercase tracking-widest">{TRANSLATIONS[lang].view_profile}</p>
                </div>
            </div>
          </div>
      </div>

      <div className="h-20 lg:h-28 flex items-center justify-center gap-8 lg:gap-12 shrink-0 z-10 pt-4">
        <button 
            onClick={() => handleSwipe('left')}
            className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-white shadow-xl text-rose-500 flex items-center justify-center text-3xl transition-all hover:scale-110 active:scale-95 border border-gray-100 hover:bg-rose-50"
        >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 lg:w-8 lg:h-8"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>
        </button>
        <button 
            onClick={() => handleSwipe('right')}
            className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-xl shadow-teal-500/30 text-white flex items-center justify-center text-3xl transition-all hover:scale-110 active:scale-95 hover:shadow-2xl"
        >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 lg:w-8 lg:h-8"><path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" /></svg>
        </button>
      </div>
    </div>
  );
};

export default Discovery;