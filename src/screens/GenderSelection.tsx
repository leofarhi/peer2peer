import React from 'react';
import { TRANSLATIONS } from '../constants';
import { Gender } from '../types';
import type { Language } from '../types';

const GenderSelection = ({ onSelect, lang }: { onSelect: (g: Gender) => void, lang: Language }) => (
    <div className="h-full w-full bg-white flex flex-col p-6 animate-fade-in">
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 text-center">{TRANSLATIONS[lang].who_are_you}</h2>
            <p className="text-gray-500 text-center mb-10">{TRANSLATIONS[lang].who_identify}</p>

            <div className="space-y-4">
                <button 
                    onClick={() => onSelect(Gender.MALE)}
                    className="w-full p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-between group"
                >
                    <span className="text-xl font-bold text-gray-700 group-hover:text-blue-600">{TRANSLATIONS[lang].gender_man}</span>
                    <span className="text-2xl">👨</span>
                </button>
                <button 
                    onClick={() => onSelect(Gender.FEMALE)}
                    className="w-full p-6 rounded-2xl border-2 border-gray-100 hover:border-pink-400 hover:bg-pink-50 transition-all flex items-center justify-between group"
                >
                    <span className="text-xl font-bold text-gray-700 group-hover:text-pink-600">{TRANSLATIONS[lang].gender_woman}</span>
                    <span className="text-2xl">👩</span>
                </button>
                <button 
                    onClick={() => onSelect(Gender.OTHER)}
                    className="w-full p-6 rounded-2xl border-2 border-gray-100 hover:border-purple-400 hover:bg-purple-50 transition-all flex items-center justify-between group"
                >
                    <span className="text-xl font-bold text-gray-700 group-hover:text-purple-600">{TRANSLATIONS[lang].gender_other}</span>
                    <span className="text-2xl">🌈</span>
                </button>
            </div>
        </div>
    </div>
);

export default GenderSelection;