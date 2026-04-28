import React from 'react';
import { TRANSLATIONS } from '../constants';
import type { Language } from '../types';

interface FooterProps {
    onContact: () => void;
    onLegal: () => void;
    onPrivacy: () => void;
    lang: Language;
    variant?: 'light' | 'dark'; // light = texte blanc (pour Login), dark = texte gris (pour Profile)
}

const Footer = ({ onContact, onLegal, onPrivacy, lang, variant = 'dark' }: FooterProps) => {
    const textColor = variant === 'light' ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-pink-500';
    const separatorColor = variant === 'light' ? 'text-white/20' : 'text-gray-300';

    return (
        <div className="w-full py-6 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[10px] md:text-xs font-medium uppercase tracking-widest transition-colors">
            <button onClick={onContact} className={`${textColor} transition-colors`}>
                {TRANSLATIONS[lang].footer_contact}
            </button>
            <span className={separatorColor}>•</span>
            <button onClick={onLegal} className={`${textColor} transition-colors`}>
                {TRANSLATIONS[lang].footer_legal}
            </button>
            <span className={separatorColor}>•</span>
            <button onClick={onPrivacy} className={`${textColor} transition-colors`}>
                {TRANSLATIONS[lang].footer_privacy}
            </button>
        </div>
    );
};

export default Footer;