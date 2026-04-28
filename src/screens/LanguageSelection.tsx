import React from 'react';
import { TRANSLATIONS } from '../constants';
import type { Language } from '../types';

const LanguageSelection = ({ 
    onSelect, 
    lang 
}: { 
    onSelect: (l: Language) => void, 
    lang: Language 
}) => (
    <div className="h-full w-full bg-white flex flex-col p-6 animate-fade-in items-center justify-center">
        <div className="w-full max-w-md">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">{TRANSLATIONS[lang].language_selection_title}</h2>
            <p className="text-gray-500 mb-8 text-center">{TRANSLATIONS[lang].language_selection_subtitle}</p>

            <div className="space-y-4">
                <button 
                    onClick={() => onSelect('en')}
                    className="w-full p-6 rounded-2xl border-2 border-gray-100 hover:border-pink-400 hover:bg-pink-50 transition-all flex items-center justify-between group"
                >
                    <span className="text-xl font-bold text-gray-700 group-hover:text-pink-600">English</span>
                    {/* CORRECTION : Classes Tailwind pour le ratio */}
                    <img 
                        src="https://flagcdn.com/w80/gb.png" 
                        srcSet="https://flagcdn.com/w160/gb.png 2x" 
                        alt="UK Flag" 
                        className="w-12 h-8 rounded shadow-sm object-cover"
                    />
                </button>

                <button 
                    onClick={() => onSelect('fr')}
                    className="w-full p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-between group"
                >
                    <span className="text-xl font-bold text-gray-700 group-hover:text-blue-600">Français</span>
                    {/* CORRECTION : Classes Tailwind pour le ratio */}
                    <img 
                        src="https://flagcdn.com/w80/fr.png" 
                        srcSet="https://flagcdn.com/w160/fr.png 2x" 
                        alt="France Flag" 
                        className="w-12 h-8 rounded shadow-sm object-cover"
                    />
                </button>
            </div>
        </div>
    </div>
);

export default LanguageSelection;