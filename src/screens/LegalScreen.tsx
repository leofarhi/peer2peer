import React from 'react';
import type { Language } from '../types';
import { TRANSLATIONS } from '../constants';

const LegalScreen = ({ onBack, lang }: { onBack: () => void, lang: Language }) => {
    const t = TRANSLATIONS[lang]; // On charge le bon dictionnaire

    return (
        <div className="h-full w-full bg-gray-50 flex flex-col animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center shrink-0 z-10">
                <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-bold px-2">
                    ← {t.legal_back}
                </button>
                <h1 className="flex-1 text-center font-bold text-lg text-gray-800">
                    {t.legal_title}
                </h1>
                <div className="w-10"></div>
            </div>

            {/* Contenu Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8 text-gray-700 space-y-6 leading-relaxed">
                    
                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.legal_editor_title}</h3>
                        <p>
                            {t.legal_editor_desc}
                            <br /><br />
                            <strong>{t.legal_developer}</strong> Léo Farhi<br />
                            <strong>{t.legal_contact_label}</strong> {t.legal_contact_value}<br />
                            <strong>{t.legal_status_label}</strong> {t.legal_status_value}
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.legal_host_title}</h3>
                        <p>
                            {t.legal_host_desc}<br />
                            <strong>{t.legal_host_name}</strong><br />
                            {t.legal_host_address}<br />
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.legal_ip_title}</h3>
                        <p>
                            {t.legal_ip_desc}
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default LegalScreen;