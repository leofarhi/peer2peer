import React from 'react';
import { IntentType, Gender, GenderPreference } from './types';
import type { UserProfile } from './types';

export const MAX_BIO_LENGTH = 300;

// --- CONFIGURATION ---
export const BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3000';

// Icons
export const Icons = {
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#D62347" transform="scale(0.8) translate(3, 3)"/>
      <path d="M12 6L12 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 12L16 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Coffee: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" fill="#7B1FA2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 1v3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 1v3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 1v3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 1v1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Gamepad: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <rect x="2" y="6" width="20" height="12" rx="6" fill="#00C865" stroke="white" strokeWidth="2"/>
      {/* Croix directionnelle (Gauche) */}
      <path d="M6 12h4M8 10v4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Boutons (Droite) */}
      <circle cx="15" cy="12" r="1.5" fill="white" />
      <circle cx="18" cy="12" r="1.5" fill="white" />
    </svg>
  ),
  GitBranch: () => (
    /* ATTENTION : Le viewBox est ici de 0 0 512 512 pour coller à ton SVG */
    <svg viewBox="0 0 512 512" fill="currentColor" className="w-full h-full">
      <title>ionicons-v5-d</title>
      <path d="M416,160a64,64,0,1,0-96.27,55.24c-2.29,29.08-20.08,37-75,48.42-17.76,3.68-35.93,7.45-52.71,13.93V151.39a64,64,0,1,0-64,0V360.61a64,64,0,1,0,64.42.24c2.39-18,16-24.33,65.26-34.52,27.43-5.67,55.78-11.54,79.78-26.95,29-18.58,44.53-46.78,46.36-83.89A64,64,0,0,0,416,160ZM160,64a32,32,0,1,1-32,32A32,32,0,0,1,160,64Zm0,384a32,32,0,1,1,32-32A32,32,0,0,1,160,448ZM352,192a32,32,0,1,1,32-32A32,32,0,0,1,352,192Z"/>
    </svg>
  ),
  Lightning: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FF9F2A" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
    </svg>
  ),
  Chat: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
    </svg>
  ),
  Logo: () => (
     <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
     </svg>
  ),
  Adjustments: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
    </svg>
  )
};

export const IntentDescriptions = {
  [IntentType.LTS]: {
    label: { en: "LTS", fr: "LTS" },
    desc: { en: "Stable release. No breaking changes.", fr: "Version stable. Pas de rupture." },
    concrete: { en: "Serious relationship", fr: "Sérieux / Long terme" },
    color: "from-red-500 to-rose-600",
    bg: "bg-red-50",
    icon: Icons.Shield
  },
  [IntentType.OPEN_SOURCE]: {
    label: { en: "Open Source", fr: "Open Source" },
    desc: { en: "Iterative process. Let's contribute and see how the project evolves.", fr: "Processus itératif. On contribue et on voit comment le projet évolue." },
    concrete: { en: "Feeling First → Long or Short Term", fr: "Au Feeling → Sérieux ou Pas" },
    color: "from-emerald-400 via-rose-500 to-indigo-600 animate-gradient-xy",
    bg: "bg-gradient-to-br from-emerald-50 via-rose-50 to-indigo-50 border-gray-200",
    icon: Icons.GitBranch
  },
  [IntentType.COFFEE]: {
    label: { en: "Coffee Break", fr: "Pause Café" },
    desc: { en: "Compilation time is coffee time.", fr: "En attendant que ça compile." },
    concrete: { en: "Chill date / Drink", fr: "Verre / Date sans pression" },
    color: "from-purple-500 to-indigo-600",
    bg: "bg-purple-50",
    icon: Icons.Coffee
  },
  [IntentType.SIDE_PROJECT]: {
    label: { en: "Side Project", fr: "Side Project" },
    desc: { en: "Fun experiments, no roadmap.", fr: "Des expériences fun, sans roadmap." },
    concrete: { en: "Friends with benefits", fr: "Sexfriends / Câlins récurrents" },
    color: "from-teal-400 to-emerald-500",
    bg: "bg-teal-50",
    icon: Icons.Gamepad
  },
  [IntentType.RUSH]: {
    label: { en: "The Rush", fr: "Le Rush" },
    desc: { en: "Fast coding, quick delivery.", fr: "Code rapide, livraison immédiate." },
    concrete: { en: "One night stand", fr: "Coup d'un soir / Rapide" },
    color: "from-orange-300 to-red-400",
    bg: "bg-orange-50",
    icon: Icons.Lightning
  }
};

export const TRANSLATIONS = {
  en: {
    login_subtitle: "Finally, finding a peer is easier than Exam Rank 02.",
    login_btn: "Login with 42",
    login_secure: "Ultra Secure Session ™",
    who_are_you: "Who are you?",
    who_identify: "How do you identify yourself?",
    gender_man: "Man",
    gender_woman: "Woman",
    gender_other: "Other / Non-binary",
    choose_intent_title: "Select Protocol",
    choose_intent_subtitle: "Choose your connection mode. Find your peer.",
    no_more_users: "No more peers nearby",
    no_more_desc: "Try adjusting your discovery settings to see more people.",
    matches_title: "Matches",
    no_matches: "No matches yet",
    swipe_more: "Swipe more to find your pair.",
    say_hello: "Pick a question to break the ice!",
    dont_be_shy: "Or just say Hi.",
    type_message: "Type a message...",
    my_intent: "My Protocol",
    change: "Change",
    my_identity: "My Identity",
    discovery_settings: "Discovery Settings",
    looking_for: "I'm looking for",
    pref_men: "Men",
    pref_women: "Women",
    pref_all: "Everyone",
    age_range: "Age Range",
    logout: "Log Out",
    nav_messages: "Messages",
    new_match: "MERGE ACCEPTED!",
    keep_swiping: "Keep Swiping",
    send_message: "Send Message",
    my_photos: "My Photos",
    my_bio: "My Bio",
    bio_placeholder: "Tell something about yourself...",
    add_photo: "Add",
    remove_photo: "Remove",
    photo_limit: "Max 4 photos",
    intra_photo_label: "42 Profile",
    view_profile: "View Profile",
    save_changes: "Save Changes",
    saved: "Saved",
    unsaved_title: "Unsaved Changes",
    unsaved_message: "You have unsaved changes. Do you want to save them?",
    discard: "Discard",
    cancel: "Cancel",
    chars: "chars",
    editor_title: "Add Photo",
    import_photo: "Import Photo",
    zoom: "Zoom",
    validate: "Validate",
    drag_hint: "Drag to position",
    years_old: "yo",
    birth_date: "Birth Date",
    birth_date_desc: "Set your birth date correctly as 42 doesn't share it.",
    when_born: "When were you born?",
    select_birth_date: "Select your birth date",
    age_error_min: "You must be at least 18 years old to use this app.",
    age_error_max: "Are you really over 150 years old? Please enter a valid date.",
    continue: "Continue",
    underage_block_title: "Access Restricted",
    underage_block_desc: "You must be 18+ to view profiles. Please update your birth date in your profile settings if this is a mistake.",
    language: "Language",
    english: "English",
    french: "Français",
    bio_setup_title: "Say something...",
    bio_setup_subtitle: "Write a short bio to introduce yourself. You can change it later.",
    tutorial_title: "Welcome to Peer2Peer",
    tutorial_subtitle: "Here is how it works",
    tut_point_1_title: "100% Real Students",
    tut_point_1_desc: "No bots. The only way to login is via 42 Intra. Everyone here is a peer.",
    tut_point_2_title: "Fair Play",
    tut_point_2_desc: "No microtransactions. No pay-to-win. Random discovery for maximum equity.",
    tut_point_3_title: "Active Profiles First",
    tut_point_3_desc: "We prioritize active users to avoid showing you 'dead' accounts.",
    tut_point_4_title: "No Catfishing",
    tut_point_4_desc: "You can add custom photos, but your last photo will ALWAYS be your 42 profile picture. Reality check.",
    tut_point_5_title: "Check Your Settings",
    tut_point_5_desc: "Don't forget to set your age preference range in settings immediately!",
    start_swiping: "Start Swiping",
    language_selection_title: "Choose your language",
    language_selection_subtitle: "Select the interface language.",
    quota_reached_title: "Quota reached!",
    quota_reached_desc: "You've swiped too much today. Come back tomorrow to see more peers.",
    banned_title: "Account Suspended",
    banned_desc: "Your account has been suspended due to violations of our community guidelines. You can no longer access Peer2Peer.",
    banned_btn: "Back to Login",

    footer_contact: "Contact Support",
    footer_legal: "Legal Notice",
    footer_privacy: "Privacy Policy",
    contact_title: "Contact Us",
    contact_desc: "Having trouble? Send us a message.",
    contact_email_label: "Your Email",
    contact_msg_label: "Message",
    contact_send: "Send Message",
    contact_success: "Message sent successfully!",
    contact_back: "Back",
    legal_dummy: "Legal Notice Page (Coming Soon)",
    privacy_dummy: "Privacy Policy Page (Coming Soon)",
  },
  fr: {
    login_subtitle: "Enfin, trouver un binôme est plus simple que l'Exam Rank 02.",
    login_btn: "Connexion via 42",
    login_secure: "Session Ultra Sécurisée ™",
    who_are_you: "Qui êtes-vous ?",
    who_identify: "Comment vous identifiez-vous ?",
    gender_man: "Homme",
    gender_woman: "Femme",
    gender_other: "Autre / Non-binaire",
    choose_intent_title: "Choisis ton Protocole",
    choose_intent_subtitle: "Choisis ton mode de connexion. Trouve ton peer.",
    no_more_users: "Aucun peer à proximité",
    no_more_desc: "Ajuste tes filtres pour voir plus de monde.",
    matches_title: "Matchs",
    no_matches: "Pas encore de matchs",
    swipe_more: "Swipe encore pour trouver ton binôme.",
    say_hello: "Choisis une question pour briser la glace !",
    dont_be_shy: "Ou dis juste Salut.",
    type_message: "Écris un message...",
    my_intent: "Mon Protocole",
    change: "Modifier",
    my_identity: "Mon Identité",
    discovery_settings: "Préférences de Découverte",
    looking_for: "Je cherche",
    pref_men: "Hommes",
    pref_women: "Femmes",
    pref_all: "Tout le monde",
    age_range: "Tranche d'âge",
    logout: "Déconnexion",
    nav_messages: "Messages",
    new_match: "MERGE ACCEPTED!",
    keep_swiping: "Continuer",
    send_message: "Envoyer un message",
    my_photos: "Mes Photos",
    my_bio: "Ma Bio",
    bio_placeholder: "Dis quelque chose sur toi...",
    add_photo: "Ajouter",
    remove_photo: "Retirer",
    photo_limit: "Max 4 photos",
    intra_photo_label: "Profil 42",
    view_profile: "Voir Profil",
    save_changes: "Sauvegarder",
    saved: "Enregistré",
    unsaved_title: "Modifications non enregistrées",
    unsaved_message: "Vous avez des modifications non enregistrées. Voulez-vous les sauvegarder ?",
    discard: "Ignorer",
    cancel: "Annuler",
    chars: "carac.",
    editor_title: "Ajouter une photo",
    import_photo: "Importer une photo",
    zoom: "Zoom",
    validate: "Valider",
    drag_hint: "Glisser pour déplacer",
    years_old: "ans",
    birth_date: "Date de Naissance",
    birth_date_desc: "Indiquez votre vraie date de naissance car 42 ne la fournit pas.",
    when_born: "Quelle est votre date de naissance ?",
    select_birth_date: "Sélectionnez votre date",
    age_error_min: "Vous devez avoir au moins 18 ans pour utiliser l'application.",
    age_error_max: "Avez-vous vraiment plus de 150 ans ? Entrez une date valide.",
    continue: "Continuer",
    underage_block_title: "Accès Restreint",
    underage_block_desc: "Vous devez avoir 18 ans ou plus pour voir les profils. Mettez à jour votre date de naissance dans les paramètres si c'est une erreur.",
    language: "Langue",
    english: "English",
    french: "Français",
    bio_setup_title: "Dis quelque chose...",
    bio_setup_subtitle: "Écris une courte bio pour te présenter. Tu pourras la changer plus tard.",
    tutorial_title: "Bienvenue sur Peer2Peer",
    tutorial_subtitle: "Voici comment ça marche",
    tut_point_1_title: "100% Vrais Étudiants",
    tut_point_1_desc: "Pas de bots. La seule connexion possible est via l'Intra 42. Ici, que des peers.",
    tut_point_2_title: "Fair Play",
    tut_point_2_desc: "Pas de micro-transactions. Pas de pay-to-win. Affichage aléatoire pour une équité totale.",
    tut_point_3_title: "Profils Actifs d'abord",
    tut_point_3_desc: "Nous mettons en avant les utilisateurs actifs pour éviter de te proposer des comptes 'morts'.",
    tut_point_4_title: "Pas de Catfish",
    tut_point_4_desc: "Tu peux ajouter des photos perso, mais ta dernière photo sera TOUJOURS celle de ton profil 42. Reality check.",
    tut_point_5_title: "Vérifie tes réglages",
    tut_point_5_desc: "N'oublie pas d'aller régler ta tranche d'âge dans les paramètres immédiatement !",
    start_swiping: "Commencer à Swiper",
    language_selection_title: "Choisissez votre langue",
    language_selection_subtitle: "Sélectionnez la langue de l'interface.",
    quota_reached_title: "Quota atteint !",
    quota_reached_desc: "T'as trop swipé pour aujourd'hui. Reviens demain pour voir plus de peers.",
    banned_title: "Compte Suspendu",
    banned_desc: "Votre compte a été suspendu suite au non-respect des règles de la communauté. Vous ne pouvez plus accéder à Peer2Peer.",
    banned_btn: "Retour à l'accueil",

    footer_contact: "Contact Support",
    footer_legal: "Mentions Légales",
    footer_privacy: "Politique de Confidentialité",
    contact_title: "Nous Contacter",
    contact_desc: "Un problème ? Envoyez-nous un message.",
    contact_email_label: "Votre Email",
    contact_msg_label: "Message",
    contact_send: "Envoyer le message",
    contact_success: "Message envoyé avec succès !",
    contact_back: "Retour",
    legal_dummy: "Page Mentions Légales (Bientôt)",
    privacy_dummy: "Page Politique de Confidentialité (Bientôt)",
  }
};

export const ICEBREAKER_QUESTIONS = [
  { en: "Vim or Emacs?", fr: "Vim ou Emacs ?" },
  { en: "How many hours of sleep during Rush?", fr: "Combien d'heures de sommeil pendant le Rush ?" },
  { en: "Your opinion on Norminette?", fr: "Ton avis sur la Norminette ?" },
  { en: "Frontend or Backend?", fr: "Frontend ou Backend ?" },
  { en: "Tabs or Spaces?", fr: "Tabs ou Espaces ?" },
  { en: "Favorite cluster: E1, E2 or E3?", fr: "Cluster préféré : E1, E2 ou E3 ?" },
  { en: "Did you survive Exam Rank 02?", fr: "T'as survécu à l'Exam Rank 02 ?" },
  { en: "Coffee or Energy Drink?", fr: "Café ou Redbull ?" },
  { en: "Segfault or Bus Error?", fr: "Segfault ou Bus Error ?" },
  { en: "Mac or Linux?", fr: "Mac ou Linux ?" },
];

export const MATCH_QUOTES = [
  { en: "You both compiled successfully!", fr: "Compilation réussie pour vous deux !" },
  { en: "No segfault between you two.", fr: "Pas de segfault entre vous." },
  { en: "It's a clean git merge.", fr: "Un git merge sans conflit." },
  { en: "Norminette approves this couple.", fr: "La Norminette valide ce couple." },
  { en: "Peer2Peer connection established.", fr: "Connexion P2P établie." },
  { en: "100% Match coverage.", fr: "100% de couverture de tests." },
];