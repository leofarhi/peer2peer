import React from 'react';
import { TRANSLATIONS } from '../constants';
import  { GenderPreference } from '../types';
import type { Language } from '../types';

const DiscoverySettingsOnboarding = ({ onSelect, lang }: { onSelect: (p: GenderPreference) => void, lang: Language }) => (
    <div className="h-full w-full bg-white flex flex-col p-6 animate-fade-in">
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-8 text-center">{TRANSLATIONS[lang].looking_for}...</h2>
            
            <div className="space-y-4">
                <button 
                    onClick={() => onSelect(GenderPreference.MEN)}
                    className="w-full p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-between group"
                >
                    <span className="text-xl font-bold text-gray-700 group-hover:text-blue-600">{TRANSLATIONS[lang].pref_men}</span>
                    <span className="text-2xl">👨</span>
                </button>
                <button 
                    onClick={() => onSelect(GenderPreference.WOMEN)}
                    className="w-full p-6 rounded-2xl border-2 border-gray-100 hover:border-pink-400 hover:bg-pink-50 transition-all flex items-center justify-between group"
                >
                    <span className="text-xl font-bold text-gray-700 group-hover:text-pink-600">{TRANSLATIONS[lang].pref_women}</span>
                    <span className="text-2xl">👩</span>
                </button>
                <button 
                    onClick={() => onSelect(GenderPreference.ALL)}
                    className="w-full p-6 rounded-2xl border-2 border-gray-100 hover:border-purple-400 hover:bg-purple-50 transition-all flex items-center justify-between group"
                >
                    <span className="text-xl font-bold text-gray-700 group-hover:text-purple-600">{TRANSLATIONS[lang].pref_all}</span>
                    <span className="text-2xl">🌎</span>
                </button>
            </div>
        </div>
    </div>
);

export default DiscoverySettingsOnboarding;