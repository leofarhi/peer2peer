import React from 'react';
import { IntentDescriptions, TRANSLATIONS } from '../constants';
import { IntentType } from '../types';
import type { Language } from '../types';

const IntentSelection = ({ onSelect, lang }: { onSelect: (f: IntentType) => void, lang: Language }) => (
  <div className="h-full w-full bg-white flex flex-col overflow-hidden relative">
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-yellow-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse delay-1000"></div>
    </div>

    <div className="shrink-0 pt-8 pb-2 px-6 md:pt-12 md:pb-6 text-center z-10">
        <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600 leading-tight mb-2">
            {TRANSLATIONS[lang].choose_intent_title}
        </h2>
        <p className="text-gray-500 text-sm md:text-lg max-w-lg mx-auto font-medium">
            {TRANSLATIONS[lang].choose_intent_subtitle}
        </p>
    </div>
        
    <div className="flex-1 min-w-0 w-full px-4 pt-4 pb-8 md:px-8 md:pt-6 md:pb-12 z-10 flex flex-col justify-center overflow-y-auto sm:overflow-hidden">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full max-w-[90rem] mx-auto sm:h-full content-center">
        {Object.values(IntentType).map((intent) => {
            const info = IntentDescriptions[intent as IntentType];
            const Icon = info.icon;

            return (
            <button
                key={intent}
                onClick={() => onSelect(intent as IntentType)}
                className={`
                    group relative w-full
                    rounded-2xl md:rounded-3xl
                    transition-all duration-300 ease-out
                    border-2 hover:scale-[1.02] active:scale-95
                    shadow-sm hover:shadow-xl
                    ${info.bg}
                    border-transparent hover:border-pink-100
                    sm:items-center
                    flex flex-row items-center text-left p-3 lg:p-4
                    sm:flex-col sm:justify-center sm:text-center
                `}
            >
                <div className={`
                    rounded-full bg-gradient-to-br ${info.color} text-white flex items-center justify-center shadow-md shrink-0 group-hover:rotate-12 transition-transform duration-300
                    w-12 h-12 mr-4
                    sm:w-16 sm:h-16 sm:mr-0 sm:mb-4
                    lg:w-20 lg:h-20 lg:mb-5
                `}>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9">
                        <Icon />
                    </div>
                </div>

                <div className="flex-1 min-w-0 sm:flex-none">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-0.5 sm:mb-1 leading-tight">{info.label[lang]}</h3>
                    <p className="text-xs sm:text-xs lg:text-sm text-gray-600 font-medium leading-tight opacity-80 mb-1 lg:mb-2 line-clamp-2">{info.desc[lang]}</p>
                    <div className={`text-xs sm:text-xs lg:text-sm font-bold leading-tight uppercase tracking-wide text-pink-600`}>
                        {info.concrete[lang]}
                    </div>
                </div>
            </button>
            );
        })}
        </div>
    </div>
  </div>
);

export default IntentSelection;