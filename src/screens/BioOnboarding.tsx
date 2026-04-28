import React, { useState } from 'react';
import { MAX_BIO_LENGTH, TRANSLATIONS } from '../constants';
import type { Language } from '../types';
import { Button } from '../components/Button';

const BioOnboarding = ({ 
    onNext, 
    lang 
}: { 
    onNext: (bio: string) => void, 
    lang: Language 
}) => {
    const [bio, setBio] = useState("");

    return (
        <div className="h-full w-full bg-white flex flex-col p-6 animate-fade-in items-center justify-center">
            <div className="w-full max-w-md">
                <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">{TRANSLATIONS[lang].bio_setup_title}</h2>
                <p className="text-gray-500 mb-8 text-center">{TRANSLATIONS[lang].bio_setup_subtitle}</p>

                <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-pink-400 focus-within:border-transparent transition-all mb-4">
                    <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder={TRANSLATIONS[lang].bio_placeholder}
                        maxLength={MAX_BIO_LENGTH}
                        className="w-full p-4 h-40 resize-none outline-none text-gray-700 text-lg rounded-xl"
                    />
                    <div className="flex justify-end px-2 pb-2">
                        <span className={`text-xs font-bold ${bio.length >= MAX_BIO_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                            {bio.length}/{MAX_BIO_LENGTH}
                        </span>
                    </div>
                </div>

                <Button 
                    onClick={() => onNext(bio)} 
                    disabled={false} // Bio is optional, can be empty
                    fullWidth 
                    className="mt-4"
                >
                    {TRANSLATIONS[lang].continue}
                </Button>
            </div>
        </div>
    );
};

export default BioOnboarding;
