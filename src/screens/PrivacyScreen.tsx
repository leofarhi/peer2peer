import React from 'react';
import type { Language } from '../types';
import { TRANSLATIONS } from '../constants';

const PrivacyScreen = ({ onBack, lang }: { onBack: () => void, lang: Language }) => {
    const t = TRANSLATIONS[lang];

    return (
        <div className="h-full w-full bg-gray-50 flex flex-col animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center shrink-0 z-10">
                <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-bold px-2">
                    ← {t.privacy_back}
                </button>
                <h1 className="flex-1 text-center font-bold text-lg text-gray-800">
                    {t.privacy_title}
                </h1>
                <div className="w-10"></div>
            </div>

            {/* Contenu Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8 text-gray-700 space-y-6 leading-relaxed">
                    
                    <p className="italic text-sm text-gray-500">
                        {t.privacy_last_updated} {new Date().toLocaleDateString()}
                    </p>
                    
                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.privacy_s1_title}</h3>
                        <p>{t.privacy_s1_desc}</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>{t.privacy_s1_b1_title}</strong>{t.privacy_s1_b1_desc}</li>
                            <li><strong>{t.privacy_s1_b2_title}</strong>{t.privacy_s1_b2_desc}</li>
                            <li><strong>{t.privacy_s1_b3_title}</strong>{t.privacy_s1_b3_desc}</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.privacy_s2_title}</h3>
                        <p>{t.privacy_s2_desc}</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>{t.privacy_s2_b1}</li>
                            <li>{t.privacy_s2_b2}</li>
                            <li>{t.privacy_s2_b3}</li>
                        </ul>
                        <p className="mt-2 font-bold text-pink-600">{t.privacy_s2_highlight}</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.privacy_s3_title}</h3>
                        <p>
                            {t.privacy_s3_desc}
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.privacy_s4_title}</h3>
                        <p>
                            {t.privacy_s4_desc}
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default PrivacyScreen;