import React, { useState, useEffect, useRef } from 'react';
import { AppView, IntentType, Gender, GenderPreference } from './types';
import type { AuthState, UserProfile, Match, Language } from './types';
import { getSession, logout, updateUserIntent, updateUserProfile, fetchCurrentUser, calculateAge } from './services/authService';
import { useDiscoveryLogic } from './hooks/useDiscoveryLogic';
import { socketService } from './services/socket';
import { BASE_URL } from './constants';

import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import MatchPopup from './components/MatchPopup';
import UnsavedChangesModal from './components/UnsavedChangesModal';
import ProfileDetail from './components/ProfileDetail';

import LoginScreen from './screens/LoginScreen';
import LanguageSelection from './screens/LanguageSelection';
import GenderSelection from './screens/GenderSelection';
import BirthDateSelection from './screens/BirthDateSelection';
import IntentSelection from './screens/IntentSelection';
import DiscoverySettingsOnboarding from './screens/DiscoverySettingsOnboarding';
import Discovery from './screens/Discovery';
import MatchesList from './screens/MatchesList';
import Chat from './screens/Chat';
import Profile from './screens/Profile';
import TutorialScreen from './screens/TutorialScreen';
import BioOnboarding from './screens/BioOnboarding';
import AdminDashboard from './screens/AdminDashboard';
import BannedScreen from './screens/BannedScreen';
import ContactScreen from './screens/ContactScreen';
import LegalScreen from './screens/LegalScreen';
import PrivacyScreen from './screens/PrivacyScreen';

const updateFavicon = (unreadCount: number) => {
    const favicon = document.getElementById('favicon') as HTMLLinkElement;
    if (!favicon) return;
    if (unreadCount === 0) {
        favicon.href = '/vite.svg';
        document.title = 'Peer2Peer';
        return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const img = new Image();
        img.src = '/vite.svg';
        img.onload = () => {
            ctx.drawImage(img, 0, 0, 32, 32);
            ctx.beginPath();
            ctx.arc(24, 8, 7, 0, 2 * Math.PI);
            ctx.fillStyle = '#ff0000';
            ctx.fill();
            favicon.href = canvas.toDataURL('image/png');
        };
    }
    document.title = `(${unreadCount}) Peer2Peer`;
};

const triggerSystemNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
        new Notification(title, { body: body, icon: '/vite.svg' });
    }
};

const fetchMatchesFromDB = async (token: string) => {
    try {
        const res = await fetch(`${BASE_URL}/api/matches`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) return await res.json();
        return [];
    } catch (e) { return []; }
};
const markMatchAsSeen = async (token: string, matchId: string) => {
    try { await fetch(`${BASE_URL}/api/matches/${matchId}/seen`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }); } catch (e) { console.error(e); }
};
const blockUserAPI = async (token: string, userId: string) => {
    try { await fetch(`${BASE_URL}/api/users/${userId}/block`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }); return true; } catch (e) { return false; }
};
const reportUserAPI = async (token: string, userId: string, reason: string) => {
    try { await fetch(`${BASE_URL}/api/users/${userId}/report`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) }); return true; } catch (e) { return false; }
};

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, currentUser: null, token: null });
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [newMatchPopup, setNewMatchPopup] = useState<Match | null>(null);
  const [profileToView, setProfileToView] = useState<UserProfile | null>(null);
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<AppView | null>(null);
  const profileSaveRef = useRef<() => void>(() => {});
  const [returnToProfile, setReturnToProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const activeMatchRef = useRef<Match | null>(null);

  useEffect(() => {
      activeMatchRef.current = activeMatch;
  }, [activeMatch]);

  const [lang, setLangState] = useState<Language>(() => {
      const saved = localStorage.getItem('p2p_lang');
      if (saved === 'fr' || saved === 'en') return saved;
      const browserLang = navigator.language || (navigator as any).userLanguage;
      return browserLang && browserLang.startsWith('fr') ? 'fr' : 'en';
  });

  const setLang = (l: Language) => {
      setLangState(l);
      localStorage.setItem('p2p_lang', l);
  };

  const handleGoToContact = () => setCurrentView(AppView.CONTACT);
  
  const handleGoToLegal = () => setCurrentView(AppView.LEGAL);
  const handleGoToPrivacy = () => setCurrentView(AppView.PRIVACY);


  const handleBackToMain = () => {
    if (authState.isAuthenticated && authState.currentUser?.isOnboarded) {
        setCurrentView(AppView.PROFILE);
    } else if (authState.isAuthenticated) {
        handleLogout();
    } else {
        setCurrentView(AppView.LOGIN);
    }
  };

  const handleBackFromContact = () => {
      if (authState.isAuthenticated && authState.currentUser?.isOnboarded) {
          setCurrentView(AppView.PROFILE);
      } else if (authState.isAuthenticated) {
          // Cas rare (onboarding pas fini), on renvoie au début ou logout
          handleLogout();
      } else {
          setCurrentView(AppView.LOGIN);
      }
  };

  const { swipableUsers, loadUsers, sendSwipe, setSwipableUsers } = useDiscoveryLogic(authState.token);

  useEffect(() => {
    if (Notification.permission === 'default') Notification.requestPermission();

    const params = new URLSearchParams(window.location.search);
    const loginDataParam = params.get('loginData');
    const errorParam = params.get('error');
    
    // --- VERIFICATION URL ADMIN ---
    const path = window.location.pathname;
    const isUrlAdmin = path === '/admin' || path === '/admin/';

    const initLogin = async () => {
        setIsLoading(true);

        if (errorParam === 'banned') {
            setCurrentView(AppView.BANNED);
            setIsLoading(false);
            return;
        }

        if (loginDataParam) {
            try {
                const loginData = JSON.parse(decodeURIComponent(loginDataParam));
                const tempSession = { isAuthenticated: true, currentUser: null, token: loginData.token };
                localStorage.setItem('42_peer2peer_session', JSON.stringify(tempSession));
                const fullSession = await fetchCurrentUser();
                if (fullSession.isBanned) {
                    setCurrentView(AppView.BANNED);
                }
                else if (fullSession.isAuthenticated && fullSession.currentUser) {
                    setAuthState(fullSession);
                    // --- ROUTING ADMIN ---
                    if (isUrlAdmin && fullSession.currentUser.isAdmin) {
                        setCurrentView(AppView.ADMIN);
                    } else {
                        setCurrentView(fullSession.currentUser.isOnboarded ? AppView.DISCOVERY : AppView.LANGUAGE_SELECTION);
                    }
                } else {
                    handleLogout();
                }
                window.history.replaceState({}, document.title, "/");
            } catch (e) { handleLogout(); }
        } else {
            const localSession = getSession();
            if (localSession.token) {
                try {
                    const freshSession = await fetchCurrentUser();
                    
                    if (freshSession.isBanned) {
                        setCurrentView(AppView.BANNED);
                    }
                    else if (freshSession.isAuthenticated && freshSession.currentUser) {
                        setAuthState(freshSession);
                        // --- ROUTING ADMIN ---
                        if (isUrlAdmin && freshSession.currentUser.isAdmin) {
                            setCurrentView(AppView.ADMIN);
                        } else {
                            setCurrentView(freshSession.currentUser.isOnboarded ? AppView.DISCOVERY : AppView.LANGUAGE_SELECTION);
                        }
                    } else {
                        handleLogout(); 
                    }
                } catch (e) { handleLogout(); }
            } else {
                setAuthState({ isAuthenticated: false, currentUser: null, token: null });
                setCurrentView(AppView.LOGIN);
            }
        }
        setIsLoading(false);
    };
    initLogin();
  }, []);

  // --- SOCKET ---
  useEffect(() => {
      if (authState.token && authState.currentUser?.isOnboarded) {
          const loadMatches = async () => {
              const data = await fetchMatchesFromDB(authState.token!);
              setMatches(data);
              const totalUnread = data.reduce((acc: number, m: any) => acc + m.unreadCount, 0);
              updateFavicon(totalUnread);
              const unseenMatch = data.find((m: any) => m.isSeen === false);
              if (unseenMatch && !newMatchPopup) setNewMatchPopup(unseenMatch);
          };
          loadMatches();
          loadUsers();

          socketService.connect(authState.token);

          const handleMatchEvent = () => {
              loadMatches();
              triggerSystemNotification("It's a Match! 🎉", "Someone liked you back!");
          };

          const handleMessageEvent = (data: any) => {
              setMatches(prev => {
                  const updated = prev.map(m => {
                      if (m.id === data.matchId) {
                          const isActiveChat = activeMatchRef.current?.id === data.matchId;
                          const shouldIncrement = !isActiveChat || !document.hasFocus();
                          
                          return {
                              ...m,
                              lastMessage: data.text,
                              timestamp: data.timestamp,
                              unreadCount: shouldIncrement ? m.unreadCount + 1 : 0
                          };
                      }
                      return m;
                  });
                  updated.sort((a, b) => b.timestamp - a.timestamp);
                  const totalUnread = updated.reduce((acc, m) => acc + m.unreadCount, 0);
                  updateFavicon(totalUnread);
                  return updated;
              });

              const isActiveChat = activeMatchRef.current?.id === data.matchId;
              if (!isActiveChat || !document.hasFocus()) {
                  triggerSystemNotification("New Message 💬", data.text);
              }
          };

          const handleWindowFocus = () => {
              const currentActive = activeMatchRef.current;
              if (currentActive) {
                  setMatches(prev => {
                      const updated = prev.map(m => 
                          m.id === currentActive.id ? { ...m, unreadCount: 0 } : m
                      );
                      const totalUnread = updated.reduce((acc, m) => acc + m.unreadCount, 0);
                      updateFavicon(totalUnread);
                      return updated;
                  });
              }
          };

          const handleForceLogout = () => {
              handleLogout();
              setCurrentView(AppView.BANNED); // Redirige direct vers l'écran banni sans recharger
          };

          socketService.on('match', handleMatchEvent);
          socketService.on('message', handleMessageEvent);
          socketService.on('force_logout', handleForceLogout);
          window.addEventListener('focus', handleWindowFocus);

          return () => {
              socketService.off('match', handleMatchEvent);
              socketService.off('message', handleMessageEvent);
              window.removeEventListener('focus', handleWindowFocus);
          };
      }
  }, [authState.token, authState.currentUser?.isOnboarded]); 

  // Handlers
  const handleLogout = () => {
    socketService.disconnect();
    logout();
    setAuthState({ isAuthenticated: false, currentUser: null, token: null });
    setCurrentView(AppView.LOGIN);
  };

  const attemptNavigation = (targetView: AppView) => {
    if (currentView === AppView.PROFILE && isProfileDirty) {
        setPendingNavigation(targetView);
    } else {
        setCurrentView(targetView);
        setActiveMatch(null); 
    }
  };

  const handleSwipeAction = async (user: UserProfile, direction: 'left' | 'right') => {
    const action = direction === 'right' ? 'LIKE' : 'PASS';
    const response = await sendSwipe(user.id, action);
    
    // --- MISE À JOUR DU QUOTA LOCAL ---
    if (response && typeof response.dailyQuota === 'number') {
        setAuthState(prev => prev.currentUser ? ({
            ...prev,
            currentUser: { ...prev.currentUser, dailyQuota: response.dailyQuota }
        }) : prev);
    }
  };

  const handleClosePopup = async () => {
      if (newMatchPopup && authState.token) {
          await markMatchAsSeen(authState.token, newMatchPopup.id);
          setNewMatchPopup(null);
          setMatches(prev => prev.map(m => m.id === newMatchPopup.id ? { ...m, isSeen: true } : m));
      }
  };

  const handleStartChatFromPopup = async () => {
      if (newMatchPopup && authState.token) {
          await markMatchAsSeen(authState.token, newMatchPopup.id);
          const matchToOpen = newMatchPopup;
          setNewMatchPopup(null);
          handleSelectMatch(matchToOpen); 
      }
  };

  const handleSelectMatch = (m: Match) => {
      setActiveMatch(m);
      setCurrentView(AppView.CHAT);
      
      setMatches(prev => {
          // Vérifier si le match est déjà dans la liste
          const exists = prev.some(match => match.id === m.id);
          
          let updatedList;
          if (exists) {
              // S'il existe, on met juste à jour le statut "lu"
              updatedList = prev.map(match => 
                  match.id === m.id ? { ...match, unreadCount: 0 } : match
              );
          } else {
              // S'il n'existe pas (nouveau match créé par l'admin), on l'ajoute au début
              updatedList = [{ ...m, unreadCount: 0 }, ...prev];
          }

          const totalUnread = updatedList.reduce((acc, m) => acc + m.unreadCount, 0);
          updateFavicon(totalUnread);
          return updatedList;
      });
  };

  const handleBlockUser = async (userId: string) => {
      if (!authState.token) return;
      await blockUserAPI(authState.token, userId);
      setMatches(prev => prev.filter(m => m.user.id !== userId));
      setSwipableUsers(prev => prev.filter(u => u.id !== userId));
      if (activeMatch?.user.id === userId) {
          setActiveMatch(null);
          setCurrentView(AppView.DISCOVERY);
      }
  };

  const handleReportUser = async (userId: string, reason: string) => {
      if (!authState.token) return;
      await reportUserAPI(authState.token, userId, reason);
  };

  const handleLanguageSelect = (selectedLang: Language) => {
      setLang(selectedLang);
      setCurrentView(AppView.GENDER_SELECTION);
  };

  const handleGenderSelect = (gender: Gender) => {
    updateUserProfile({ gender });
    setAuthState(prev => prev.currentUser ? ({ ...prev, currentUser: { ...prev.currentUser, gender } }) : prev);
    setCurrentView(AppView.BIRTH_DATE_SELECTION);
  };

  const handleBirthDateSelect = (dateIso: string) => {
    updateUserProfile({ birthDate: dateIso });
    const newAge = calculateAge(dateIso);
    setAuthState(prev => prev.currentUser ? ({ 
        ...prev, 
        currentUser: { 
            ...prev.currentUser, 
            birthDate: dateIso,
            age: newAge,
            discoverySettings: {
                ...prev.currentUser.discoverySettings,
                ageRange: [Math.max(18, newAge - 5), newAge + 5]
            }
        } 
    }) : prev);
    setCurrentView(AppView.INTENT_SELECTION);
  };

  const handleIntentSelect = (intent: IntentType) => {
    updateUserIntent(intent); 
    setAuthState(prev => prev.currentUser ? ({ ...prev, currentUser: { ...prev.currentUser, intent } }) : prev);
    if (returnToProfile) { setCurrentView(AppView.PROFILE); setReturnToProfile(false); } 
    else { setCurrentView(AppView.DISCOVERY_SETTINGS_ONBOARDING); }
  };

  const handleDiscoveryPreferenceSelect = (pref: GenderPreference) => {
    const newSettings = { ...authState.currentUser!.discoverySettings, genderPreference: pref };
    updateUserProfile({ discoverySettings: newSettings }); 
    setAuthState(prev => prev.currentUser ? ({ ...prev, currentUser: { ...prev.currentUser, discoverySettings: newSettings } }) : prev);
    setCurrentView(AppView.BIO_ONBOARDING);
  };

  const handleBioSubmit = (bio: string) => {
      updateUserProfile({ bio });
      setAuthState(prev => prev.currentUser ? ({ ...prev, currentUser: { ...prev.currentUser, bio } }) : prev);
      setCurrentView(AppView.TUTORIAL);
  };

  const handleTutorialComplete = () => {
      updateUserProfile({ isOnboarded: true });
      setAuthState(prev => prev.currentUser ? ({ ...prev, currentUser: { ...prev.currentUser, isOnboarded: true } }) : prev);
      setCurrentView(AppView.DISCOVERY);
  };

  if (isLoading) {
      return (
          <div className="h-screen w-screen bg-white flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-500 border-solid"></div>
          </div>
      );
  }

  // --- ECRAN BANNI ---
  if (currentView === AppView.BANNED) {
      return <BannedScreen onLogout={handleLogout} lang={lang} />;
  }

  // --- ECRAN ADMIN ---
  if (currentView === AppView.ADMIN) {
      return (
          <AdminDashboard 
              onBack={() => { 
                  window.history.pushState({}, '', '/'); 
                  setCurrentView(AppView.DISCOVERY); 
              }}
              // NOUVEAU PROP
              onChat={(match) => {
                  window.history.pushState({}, '', '/'); // On enlève /admin de l'URL
                  handleSelectMatch(match); // Ouvre le chat et met à jour activeMatch
              }}
          />
      );
  }

  if (currentView === AppView.CONTACT) {
      return <ContactScreen onBack={handleBackFromContact} lang={lang} />;
  }

  if (currentView === AppView.LEGAL) {
      return <LegalScreen onBack={handleBackToMain} lang={lang} />;
  }

  if (currentView === AppView.PRIVACY) {
      return <PrivacyScreen onBack={handleBackToMain} lang={lang} />;
  }

  if (currentView === AppView.LANGUAGE_SELECTION) return <LanguageSelection onSelect={handleLanguageSelect} lang={lang} />;
  if (currentView === AppView.LOGIN) {
      return (
        <LoginScreen 
            onLogin={() => window.location.href = `${BASE_URL}/auth/42`} 
            onContact={handleGoToContact}
            onLegal={handleGoToLegal}
            onPrivacy={handleGoToPrivacy}
            lang={lang} 
        />
      );
  }
  if (currentView === AppView.GENDER_SELECTION) return <GenderSelection onSelect={handleGenderSelect} lang={lang} />;
  if (currentView === AppView.BIRTH_DATE_SELECTION) return <BirthDateSelection onSelect={handleBirthDateSelect} lang={lang} />;
  if (currentView === AppView.INTENT_SELECTION) return <IntentSelection onSelect={handleIntentSelect} lang={lang} />;
  if (currentView === AppView.DISCOVERY_SETTINGS_ONBOARDING) return <DiscoverySettingsOnboarding onSelect={handleDiscoveryPreferenceSelect} lang={lang} />;
  if (currentView === AppView.BIO_ONBOARDING) return <BioOnboarding onNext={handleBioSubmit} lang={lang} />;
  if (currentView === AppView.TUTORIAL) return <TutorialScreen onComplete={handleTutorialComplete} lang={lang} />;
  
  return (
    <div className="h-screen h-dvh w-screen bg-white lg:bg-gray-100 flex overflow-hidden">
        {pendingNavigation && (
            <UnsavedChangesModal 
                onSave={() => { if(profileSaveRef.current) profileSaveRef.current(); setIsProfileDirty(false); if(pendingNavigation) { setCurrentView(pendingNavigation); setPendingNavigation(null); } }}
                onDiscard={() => { setIsProfileDirty(false); if(pendingNavigation) { setCurrentView(pendingNavigation); setPendingNavigation(null); } }}
                onCancel={() => setPendingNavigation(null)}
                lang={lang}
            />
        )}
        {newMatchPopup && authState.currentUser && (
            <MatchPopup 
                user={authState.currentUser}
                matchUser={newMatchPopup.user}
                onClose={handleClosePopup}
                onChat={handleStartChatFromPopup}
                lang={lang}
            />
        )}
        {profileToView && (
            <ProfileDetail 
                user={profileToView} 
                onClose={() => setProfileToView(null)} 
                lang={lang} 
                isMatchView={true} 
                onBlock={handleBlockUser}
                onReport={handleReportUser}
            />
        )}
        {authState.currentUser && (
            <Sidebar 
                currentUser={authState.currentUser}
                matches={matches}
                activeMatchId={activeMatch?.id}
                totalNotifications={matches.reduce((acc, m) => acc + m.unreadCount, 0)}
                lang={lang}
                onNavigate={attemptNavigation}
                onSelectMatch={handleSelectMatch}
                onViewProfile={setProfileToView}
            />
        )}
        <main className="flex-1 h-full relative flex flex-col overflow-hidden bg-gray-50">
            <div className="flex-1 relative w-full overflow-hidden flex flex-col">
                <div className={`h-full w-full flex-col ${currentView === AppView.DISCOVERY ? 'flex' : (currentView === AppView.MATCHES ? 'hidden lg:flex' : 'hidden')}`}>
                    {authState.currentUser && (
                         <Discovery user={authState.currentUser} users={swipableUsers} onSwipe={handleSwipeAction} lang={lang} />
                    )}
                </div>
                {currentView === AppView.CHAT && activeMatch && (
                    <Chat 
                        match={activeMatch} 
                        onBack={() => { setActiveMatch(null); attemptNavigation(window.innerWidth >= 1024 ? AppView.DISCOVERY : AppView.MATCHES); }}
                        sendMessage={(txt) => setMatches(prev => prev.map(m => m.id === activeMatch.id ? { ...m, lastMessage: txt } : m))}
                        isDesktop={window.innerWidth >= 1024}
                        lang={lang}
                        onViewProfile={setProfileToView}
                    />
                )}
                <div className={`${(currentView === AppView.MATCHES) ? 'block lg:hidden' : 'hidden'} h-full`}>
                    <MatchesList matches={matches} onSelectMatch={handleSelectMatch} lang={lang} onViewProfile={setProfileToView} />
                </div>
                {currentView === AppView.PROFILE && authState.currentUser && (
                    <Profile 
                        user={authState.currentUser} 
                        onLogout={handleLogout}
                        onChangeIntent={() => { setReturnToProfile(true); attemptNavigation(AppView.INTENT_SELECTION); }} 
                        onUpdateProfile={(updates) => { updateUserProfile(updates); setAuthState(prev => prev.currentUser ? ({ ...prev, currentUser: { ...prev.currentUser, ...updates } }) : prev); }}
                        lang={lang}
                        setLang={setLang}
                        setIsDirty={setIsProfileDirty}
                        saveRef={profileSaveRef}
                        onContact={handleGoToContact}
                        onLegal={handleGoToLegal}
                        onPrivacy={handleGoToPrivacy}
                    />
                )}
            </div>
            <MobileNav currentView={currentView} totalNotifications={matches.reduce((acc, m) => acc + m.unreadCount, 0)} onNavigate={attemptNavigation} />
        </main>
    </div>
  );
};

export default App;