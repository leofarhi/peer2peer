import React from 'react';
import type { Language } from '../types';

const PrivacyScreen = ({ onBack, lang }: { onBack: () => void, lang: Language }) => {
    return (
        <div className="h-full w-full bg-gray-50 flex flex-col animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center shrink-0 z-10">
                <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-bold px-2">
                    ← {lang === 'fr' ? 'Retour' : 'Back'}
                </button>
                <h1 className="flex-1 text-center font-bold text-lg text-gray-800">
                    {lang === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy'}
                </h1>
                <div className="w-10"></div>
            </div>

            {/* Contenu Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8 text-gray-700 space-y-6 leading-relaxed">
                    
                    {lang === 'fr' ? (
                        <>
                            <p className="italic text-sm text-gray-500">Dernière mise à jour : {new Date().toLocaleDateString()}</p>
                            
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Données collectées</h3>
                                <p>Dans le cadre de l'utilisation de Peer2Peer, nous traitons les données suivantes :</p>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li><strong>Données 42 (via API) :</strong> Login, Email, Photo de profil, Campus.</li>
                                    <li><strong>Données déclaratives :</strong> Bio, Genre, Préférences de rencontre, Photos additionnelles, Date de naissance.</li>
                                    <li><strong>Données d'utilisation :</strong> Logs de connexion, Matchs, Messages échangés.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">2. Finalité du traitement</h3>
                                <p>Ces données sont utilisées uniquement pour :</p>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Permettre la connexion sécurisée via l'Intra 42.</li>
                                    <li>Vous proposer des profils pertinents (Matching).</li>
                                    <li>Assurer la sécurité et la modération de la plateforme.</li>
                                </ul>
                                <p className="mt-2 font-bold text-pink-600">Aucune donnée n'est revendue à des tiers.</p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">3. Visibilité</h3>
                                <p>
                                    Votre profil (Photo, Prénom, Âge, Bio) est visible uniquement par les autres étudiants connectés sur l'application.
                                    Vos messages privés ne sont accessibles qu'à vous et votre interlocuteur (sauf signalement nécessitant une modération).
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">4. Vos Droits (RGPD)</h3>
                                <p>
                                    Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
                                    Vous pouvez supprimer votre compte et toutes les données associées en contactant l'administrateur via le formulaire de contact.
                                </p>
                            </section>
                        </>
                    ) : (
                        <>
                            <p className="italic text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                            
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Data Collected</h3>
                                <p>As part of Peer2Peer, we process the following data:</p>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li><strong>42 Data (via API):</strong> Login, Email, Profile picture, Campus.</li>
                                    <li><strong>Declarative Data:</strong> Bio, Gender, Preferences, Custom photos, Birth date.</li>
                                    <li><strong>Usage Data:</strong> Connection logs, Matches, Messages.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">2. Purpose</h3>
                                <p>This data is used solely to:</p>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Allow secure login via 42 Intra.</li>
                                    <li>Suggest relevant profiles (Matching).</li>
                                    <li>Ensure platform security and moderation.</li>
                                </ul>
                                <p className="mt-2 font-bold text-pink-600">No data is sold to third parties.</p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">3. Visibility</h3>
                                <p>
                                    Your profile (Photo, Name, Age, Bio) is visible only to other students logged into the app.
                                    Private messages are accessible only to you and your match (unless reported for moderation).
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">4. Your Rights (GDPR)</h3>
                                <p>
                                    In accordance with GDPR, you have the right to access, rectify, and delete your data.
                                    You can delete your account and all associated data by contacting the administrator via the contact form.
                                </p>
                            </section>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default PrivacyScreen;