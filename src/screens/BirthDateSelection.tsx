import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import type { Language } from '../types';
import { Button } from '../components/Button';

const BirthDateSelection = ({ 
    onSelect, 
    lang 
}: { 
    onSelect: (date: string) => void, 
    lang: Language 
}) => {
    const [date, setDate] = useState("");
    const [error, setError] = useState<string | null>(null);

    const validateAndSubmit = () => {
        if (!date) return;

        const birth = new Date(date);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        if (age < 18) {
            setError(TRANSLATIONS[lang].age_error_min);
            // On peut choisir de bloquer ici ou laisser passer et bloquer dans Discovery.
            // Vu la demande "Le compte ne doit pas être accessible pour les moins de 18 ans",
            // on peut les bloquer ici OU les laisser entrer mais voir l'écran de blocage.
            // Pour l'UX, bloquons ici l'inscription :
            return;
        }

        if (age > 150) {
            setError(TRANSLATIONS[lang].age_error_max);
            return;
        }

        setError(null);
        // On envoie une date ISO
        onSelect(new Date(date).toISOString());
    };

    return (
        <div className="h-full w-full bg-white flex flex-col p-6 animate-fade-in items-center justify-center">
            <div className="w-full max-w-md">
                <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">{TRANSLATIONS[lang].when_born}</h2>
                <p className="text-gray-500 mb-8 text-center">{TRANSLATIONS[lang].select_birth_date}</p>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
                    <input 
                        type="date" 
                        value={date}
                        onChange={(e) => { setDate(e.target.value); setError(null); }}
                        className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-lg text-center"
                    />
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-bold">
                        {error}
                    </div>
                )}

                <Button 
                    onClick={validateAndSubmit} 
                    disabled={!date} 
                    fullWidth 
                    className="mt-4"
                >
                    {TRANSLATIONS[lang].continue}
                </Button>
            </div>
        </div>
    );
};

export default BirthDateSelection;