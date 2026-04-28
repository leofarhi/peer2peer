// 1. Imports des VALEURS
import { IntentType, Gender, GenderPreference } from '../types';

// 2. Imports des TYPES (Type-only imports)
import type { UserProfile, AuthState, DiscoverySettings } from '../types';
import { BASE_URL } from '../constants';

const STORAGE_KEY = '42_peer2peer_session';
const API_URL = `${BASE_URL}/api`;

// --- UTILS ---
export const calculateAge = (birthDate: string | undefined): number => {
    if (!birthDate) return 18;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

export const getSession = (): AuthState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Invalid session", e);
    }
  }
  return { isAuthenticated: false, currentUser: null, token: null };
};

export const loginWith42 = async (): Promise<AuthState> => {
  window.location.href = `${BASE_URL}/auth/42`;
  return new Promise(() => {});
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// --- API CALL GENÉRIQUE ---
const apiCall = async (endpoint: string, method: string, body?: any) => {
    const session = getSession();
    if (!session.token) return null;

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method,
            // SÉCURITÉ : Anti-cache pour forcer la vérification serveur à chaque fois
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`,
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            body: body ? JSON.stringify(body) : undefined
        });
        if (res.status === 403) {
            return { error: 'BANNED' };
        }
        if (!res.ok) throw new Error('API Call Failed');
        return await res.json();
    } catch (error) {
        console.error("API Error:", error);
        return null;
    }
};

export const updateUserIntent = async (intent: IntentType): Promise<AuthState> => {
    return updateUserProfile({ intent });
};

// --- SAUVEGARDE EN DB ET LOCALE ---
export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<AuthState> => {
    const session = getSession();
    if (session.isAuthenticated && session.currentUser) {
      
      // 1. Mise à jour Locale (Optimiste)
      const updatedUser = { ...session.currentUser, ...updates };
      
      // RECALCUL DE L'AGE SI LA DATE CHANGE (Pour affichage immédiat)
      if (updates.birthDate) {
          updatedUser.age = calculateAge(updates.birthDate);
          
          if (!updates.discoverySettings) {
              const min = Math.max(18, updatedUser.age - 5);
              const max = updatedUser.age + 5;
              updatedUser.discoverySettings = {
                  ...updatedUser.discoverySettings,
                  ageRange: [min, max]
              };
          }
      }

      // RECALCUL DES PHOTOS
      if (updatedUser.customPhotos && updatedUser.customPhotos.length >= 0) {
          updatedUser.photos = [...updatedUser.customPhotos, updatedUser.intraPhoto];
      } else {
          updatedUser.photos = [updatedUser.intraPhoto];
      }

      session.currentUser = updatedUser;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

      // 2. Envoi au Backend (Sauvegarde réelle en DB)
      await apiCall('/me', 'PUT', {
          bio: updatedUser.bio,
          gender: updatedUser.gender,
          intent: updatedUser.intent,
          isOnboarded: updatedUser.isOnboarded,
          customPhotos: updatedUser.customPhotos,
          discoverySettings: updatedUser.discoverySettings,
          birthDate: updatedUser.birthDate 
      });
    }
    return session;
};


export const fetchCurrentUser = async (): Promise<AuthState> => {
    const session = getSession();
    if (!session.token) return session;

    // Appel API pour vérifier si l'user existe toujours en DB
    const userData = await apiCall('/me', 'GET');

    // --- GESTION SPÉCIFIQUE DU BAN ---
    if (userData && userData.error === 'BANNED') {
        logout(); // On nettoie la session locale
        return { isAuthenticated: false, currentUser: null, token: null, isBanned: true };
    }
    
    // SÉCURITÉ : Si l'API ne renvoie rien (ex: 404 User Not Found, ou Token invalide)
    if (!userData) {
        logout(); // On détruit le localStorage immédiatement
        return { isAuthenticated: false, currentUser: null, token: null };
    }
    
    // Si tout va bien, on met à jour avec les données fraîches
    if (userData) {
        const freshUser: UserProfile = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            age: userData.age, 
            birthDate: userData.birthDate,
            gender: userData.gender,
            campus: userData.campus,
            intraLogin: userData.intraLogin,
            bio: userData.bio || '',
            intraPhoto: userData.intraPhoto,
            customPhotos: userData.customPhotos,
            photos: [...userData.customPhotos, userData.intraPhoto],
            intent: userData.intent,
            discoverySettings: {
                ageRange: [userData.ageMin, userData.ageMax],
                genderPreference: userData.genderPref
            },
            dailyQuota: userData.dailyQuota,
            isOnboarded: userData.isOnboarded,
            isOnline: userData.isOnline,
            isAdmin: userData.isAdmin || false,
            isBanned: userData.isBanned || false
        };

        session.currentUser = freshUser;
        session.isAuthenticated = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        
        return session;
    }
    
    return session;
};