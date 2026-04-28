import React from 'react';
import type { Language } from '../types';

const LegalScreen = ({ onBack, lang }: { onBack: () => void, lang: Language }) => {
    return (
        <div className="h-full w-full bg-gray-50 flex flex-col animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center shrink-0 z-10">
                <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-bold px-2">
                    ← {lang === 'fr' ? 'Retour' : 'Back'}
                </button>
                <h1 className="flex-1 text-center font-bold text-lg text-gray-800">
                    {lang === 'fr' ? 'Mentions Légales' : 'Legal Notice'}
                </h1>
                <div className="w-10"></div>
            </div>

            {/* Contenu Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8 text-gray-700 space-y-6 leading-relaxed">
                    
                    {lang === 'fr' ? (
                        <>
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Éditeur du site</h3>
                                <p>
                                    L'application <strong>Peer2Peer</strong> est un projet étudiant développé dans le cadre du cursus de l'école 42.
                                    <br /><br />
                                    <strong>Développeur :</strong> [TON NOM OU PSEUDO]<br />
                                    <strong>Contact :</strong> via le formulaire de contact de l'application.<br />
                                    <strong>Statut :</strong> Projet pédagogique à but non lucratif.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">2. Hébergement</h3>
                                <p>
                                    L'application est hébergée par :<br />
                                    <strong>[NOM HÉBERGEUR - EX: Vercel / OVH / Localhost]</strong><br />
                                    [Adresse de l'hébergeur si connue]<br />
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">3. Propriété Intellectuelle</h3>
                                <p>
                                    Le code source de l'application est la propriété de son auteur. 
                                    Le logo et l'identité visuelle de l'école 42 appartiennent à l'association 42.
                                </p>
                            </section>
                        </>
                    ) : (
                        <>
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Site Editor</h3>
                                <p>
                                    The <strong>Peer2Peer</strong> application is a student project developed as part of the 42 school curriculum.
                                    <br /><br />
                                    <strong>Developer:</strong> [YOUR NAME]<br />
                                    <strong>Contact:</strong> via the app's contact form.<br />
                                    <strong>Status:</strong> Non-profit educational project.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">2. Hosting</h3>
                                <p>
                                    The application is hosted by:<br />
                                    <strong>[HOST NAME - EX: Vercel / OVH]</strong><br />
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">3. Intellectual Property</h3>
                                <p>
                                    The source code belongs to its author. 
                                    The 42 school logo and visual identity belong to the 42 association.
                                </p>
                            </section>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default LegalScreen;