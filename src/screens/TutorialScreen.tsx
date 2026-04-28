import React from 'react';
import { TRANSLATIONS } from '../constants';
import type { Language } from '../types';
import { Button } from '../components/Button';

const TutorialScreen = ({ 
    onComplete, 
    lang 
}: { 
    onComplete: () => void, 
    lang: Language 
}) => {
    
    const points = [
        {
            icon: "🎓",
            title: TRANSLATIONS[lang].tut_point_1_title,
            desc: TRANSLATIONS[lang].tut_point_1_desc
        },
        {
            icon: "⚖️",
            title: TRANSLATIONS[lang].tut_point_2_title,
            desc: TRANSLATIONS[lang].tut_point_2_desc
        },
        {
            icon: "🔥",
            title: TRANSLATIONS[lang].tut_point_3_title,
            desc: TRANSLATIONS[lang].tut_point_3_desc
        },
        {
            icon: "📸",
            title: TRANSLATIONS[lang].tut_point_4_title,
            desc: TRANSLATIONS[lang].tut_point_4_desc
        },
        {
            icon: "⚙️",
            title: TRANSLATIONS[lang].tut_point_5_title,
            desc: TRANSLATIONS[lang].tut_point_5_desc
        }
    ];

    return (
        <div className="h-full w-full bg-white flex flex-col animate-fade-in relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="flex-1 overflow-y-auto px-6 py-8 pb-32 max-w-2xl mx-auto w-full no-scrollbar">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{TRANSLATIONS[lang].tutorial_title}</h2>
                    <p className="text-gray-500 font-medium">{TRANSLATIONS[lang].tutorial_subtitle}</p>
                </div>

                <div className="space-y-6">
                    {points.map((p, i) => (
                        <div key={i} className="flex items-start bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 hover:border-pink-200 transition-colors shadow-sm">
                            <div className="text-3xl mr-4 bg-gray-50 w-12 h-12 flex items-center justify-center rounded-full shrink-0">
                                {p.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1">{p.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent z-10">
                <div className="max-w-2xl mx-auto">
                    <Button onClick={onComplete} fullWidth className="py-4 text-lg shadow-xl shadow-pink-200">
                        {TRANSLATIONS[lang].start_swiping} 🚀
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TutorialScreen;
