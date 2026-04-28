export const IntentType = {
  LTS: 'LTS',
  COFFEE: 'COFFEE',
  OPEN_SOURCE: 'OPEN_SOURCE',
  SIDE_PROJECT: 'SIDE_PROJECT',
  RUSH: 'RUSH'
} as const;
export type IntentType = typeof IntentType[keyof typeof IntentType];

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
} as const;
export type Gender = typeof Gender[keyof typeof Gender];

export const GenderPreference = {
  MEN: 'MEN',
  WOMEN: 'WOMEN',
  ALL: 'ALL'
} as const;
export type GenderPreference = typeof GenderPreference[keyof typeof GenderPreference];


// --- 2. Interfaces ---

export interface Report {
  id: string;
  reason: string;
  createdAt: string;
 reporter: { name: string, id: string, login: string };
  reported: { name: string, id: string, intraPhoto: string, login: string };
}

export interface ContactMessage {
  id: string;
  email: string;
  message: string;
  createdAt: string;
  user?: { login: string, intraPhoto: string }; // Optionnel
}

export interface AdminUserView extends UserProfile {
    _count: { reportedBy: number };
    createdAt: string;
    lastActive: string;
}

export interface DiscoverySettings {
  ageRange: [number, number];
  genderPreference: GenderPreference;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  birthDate?: string;
  gender: Gender;
  campus: string; 
  intraLogin: string;
  bio: string;
  
  intraPhoto: string; 
  customPhotos: string[]; 
  photos: string[]; 

  intent: IntentType;
  discoverySettings: DiscoverySettings;
  dailyQuota: number;
  visibilityScore: number;
  
  isOnboarded: boolean;
  isOnline: boolean;

  isAdmin: boolean;
  isBanned: boolean;
}

export interface Match {
  id: string;
  user: UserProfile;
  timestamp: number;
  lastMessage?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export const AppView = {
  LOGIN: 'LOGIN',
  LANGUAGE_SELECTION: 'LANGUAGE_SELECTION',
  GENDER_SELECTION: 'GENDER_SELECTION',
  BIRTH_DATE_SELECTION: 'BIRTH_DATE_SELECTION',
  INTENT_SELECTION: 'INTENT_SELECTION',
  DISCOVERY_SETTINGS_ONBOARDING: 'DISCOVERY_SETTINGS_ONBOARDING',
  BIO_ONBOARDING: 'BIO_ONBOARDING',
  TUTORIAL: 'TUTORIAL',
  DISCOVERY: 'DISCOVERY',
  MATCHES: 'MATCHES',
  CHAT: 'CHAT',
  PROFILE: 'PROFILE',
  ADMIN: 'ADMIN',
  BANNED: 'BANNED',
  CONTACT: 'CONTACT',
  LEGAL: 'LEGAL',
  PRIVACY: 'PRIVACY'
} as const;
export type AppView = typeof AppView[keyof typeof AppView];

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  token: string | null;
  isBanned?: boolean;
}

export type Language = 'en' | 'fr';