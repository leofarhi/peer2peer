import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import Footer from '../components/Footer';
import DoubleRangeSlider from '../components/DoubleRangeSlider';
import PhotoEditorModal from '../components/PhotoEditorModal';
import { IntentDescriptions, MAX_BIO_LENGTH, TRANSLATIONS } from '../constants';
import { Gender, GenderPreference } from '../types';
import type { Language, UserProfile } from '../types';

const Profile = ({ 
    user, 
    onLogout, 
    onChangeIntent,
    onUpdateProfile,
    lang,
    setLang,
    setIsDirty,
    saveRef,
    onContact,
    onLegal,
    onPrivacy
}: { 
    user: UserProfile, 
    onLogout: () => void,
    onChangeIntent: () => void,
    onUpdateProfile: (updates: Partial<UserProfile>) => void,
    lang: Language,
    setLang: (l: Language) => void,
    setIsDirty: (isDirty: boolean) => void,
    saveRef: React.MutableRefObject<() => void>,
    onContact: () => void,
    onLegal: () => void,
    onPrivacy: () => void
}) => {
    const intentInfo = IntentDescriptions[user.intent];
    const FIcon = intentInfo.icon;
    
    const [localUser, setLocalUser] = useState<UserProfile>(user);
    const [isLocalDirty, setIsLocalDirty] = useState(false);
    const [showPhotoEditor, setShowPhotoEditor] = useState(false);

    useEffect(() => {
        const isDirty = JSON.stringify(localUser) !== JSON.stringify(user);
        setIsLocalDirty(isDirty);
        setIsDirty(isDirty);
    }, [localUser, user, setIsDirty]);

    useEffect(() => {
        saveRef.current = () => { onUpdateProfile(localUser); };
    }, [localUser, onUpdateProfile, saveRef]);

    const handleSaveClick = () => { saveRef.current(); };

    const updateLocal = (updates: Partial<UserProfile>) => {
        setLocalUser(prev => ({ ...prev, ...updates }));
    };

    const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        if (text.length <= MAX_BIO_LENGTH) { updateLocal({ bio: text }); }
    };

    // --- Date Handler ---
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateStr = e.target.value;
        if (dateStr) {
            // Astuce : On force l'heure à midi pour éviter que le décalage horaire
            // ne change le jour lors de la conversion en ISO
            const date = new Date(dateStr);
            date.setHours(12, 0, 0, 0); 
            updateLocal({ birthDate: date.toISOString() });
        }
    };

    const getFormattedDate = () => {
        if (!localUser.birthDate) return "";
        return new Date(localUser.birthDate).toISOString().split('T')[0];
    };

    // --- Photo Logic ---
    const handleAddPhotoClick = () => { if (localUser.customPhotos.length >= 4) return; setShowPhotoEditor(true); };
    const handlePhotoSave = (newUrl: string) => { const newPhotos = [...localUser.customPhotos, newUrl]; updateLocal({ customPhotos: newPhotos }); setShowPhotoEditor(false); };
    const handleRemovePhoto = (index: number) => { const newPhotos = localUser.customPhotos.filter((_, i) => i !== index); updateLocal({ customPhotos: newPhotos }); };
    const handleMovePhoto = (index: number, direction: 'left' | 'right') => {
        if (direction === 'left' && index === 0) return;
        if (direction === 'right' && index === localUser.customPhotos.length - 1) return;
        const newPhotos = [...localUser.customPhotos];
        const swapIndex = direction === 'left' ? index - 1 : index + 1;
        [newPhotos[index], newPhotos[swapIndex]] = [newPhotos[swapIndex], newPhotos[index]];
        updateLocal({ customPhotos: newPhotos });
    };

    const renderPhotoSlots = () => {
        const slots = [];
        for (let i = 0; i < 4; i++) {
            if (i < localUser.customPhotos.length) {
                slots.push(
                    <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden group bg-gray-100 border border-gray-200 shadow-sm">
                        <img src={localUser.customPhotos[i]} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                             <button onClick={() => handleRemovePhoto(i)} className="bg-red-500 text-white rounded-full p-1.5 hover:scale-110 transition-transform"><svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg></button>
                             <div className="flex gap-2">
                                {i > 0 && <button onClick={() => handleMovePhoto(i, 'left')} className="bg-white/20 hover:bg-white/40 text-white rounded-full p-1"><svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"/></svg></button>}
                                {i < localUser.customPhotos.length - 1 && <button onClick={() => handleMovePhoto(i, 'right')} className="bg-white/20 hover:bg-white/40 text-white rounded-full p-1"><svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/></svg></button>}
                             </div>
                        </div>
                    </div>
                );
            } else if (i === localUser.customPhotos.length) {
                slots.push(
                    <button key={i} onClick={handleAddPhotoClick} className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-pink-400 hover:text-pink-500 hover:bg-pink-50 transition-colors">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mb-1"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>
                        <span className="text-xs font-bold">{TRANSLATIONS[lang].add_photo}</span>
                    </button>
                );
            } else {
                 slots.push(<div key={i} className="aspect-[3/4] rounded-xl bg-gray-50 border border-gray-100"></div>);
            }
        }
        slots.push(
            <div key="intra" className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-900 shadow-md">
                <img src={localUser.intraPhoto} className="w-full h-full object-cover opacity-80" />
                <div className="absolute top-2 right-2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded font-mono">42</div>
                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-center"><span className="text-white text-[10px] uppercase font-bold tracking-wider">{TRANSLATIONS[lang].intra_photo_label}</span></div>
            </div>
        );
        return slots;
    };

    return (
        <div className="h-full w-full overflow-y-auto p-4 md:p-6 flex flex-col items-center justify-start bg-gray-50 pb-24 relative">
            {showPhotoEditor && (<PhotoEditorModal onSave={handlePhotoSave} onCancel={() => setShowPhotoEditor(false)} lang={lang} />)}

            <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-xl overflow-hidden shrink-0 mb-6">
                <div className="h-32 bg-gradient-to-r from-pink-400 to-rose-400 relative">
                     <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                        <div className="relative">
                            <img src={localUser.photos[0]} alt="Me" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-gray-200" />
                            <div className={`absolute bottom-1 right-1 w-8 h-8 bg-gradient-to-br ${intentInfo.color} rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm`}>
                                <div className="w-4 h-4"><FIcon /></div>
                            </div>
                        </div>
                     </div>
                </div>
                <div className="pt-20 pb-6 px-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-1">{localUser.name}, {localUser.age} {TRANSLATIONS[lang].years_old}</h2>
                    <p className="text-gray-500 font-medium mb-4">{localUser.intraLogin}</p>
                </div>
            </div>

            <div className="w-full max-w-xl space-y-6">
                
                {/* --- LANGUAGE SETTING --- */}
                 <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-800 font-bold text-lg mb-4">{TRANSLATIONS[lang].language}</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setLang('en')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition-colors ${lang === 'en' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                            {TRANSLATIONS[lang].english}
                        </button>
                        <button onClick={() => setLang('fr')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition-colors ${lang === 'fr' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                            {TRANSLATIONS[lang].french}
                        </button>
                    </div>
                </div>

                {/* --- DATE DE NAISSANCE --- */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-800 font-bold text-lg mb-4">{TRANSLATIONS[lang].birth_date}</h3>
                    <input 
                        type="date" 
                        value={getFormattedDate()} 
                        onChange={handleDateChange}
                        className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-700"
                    />
                    <p className="text-xs text-gray-400 mt-2">{TRANSLATIONS[lang].birth_date_desc}</p>
                </div>

                {/* ... LE RESTE NE CHANGE PAS ... */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-800 font-bold text-lg">{TRANSLATIONS[lang].my_intent}</h3>
                        <button onClick={onChangeIntent} className="text-pink-500 font-bold text-sm hover:underline">{TRANSLATIONS[lang].change}</button>
                    </div>
                    <div className="flex items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${intentInfo.color} text-white flex items-center justify-center mr-4 shrink-0`}>
                            <div className="w-5 h-5"><FIcon /></div>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">{intentInfo.label[lang]}</p>
                            <p className="text-xs text-gray-500">{intentInfo.desc[lang]}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                     <div className="flex justify-between items-center mb-4">
                         <h3 className="text-gray-800 font-bold text-lg">{TRANSLATIONS[lang].my_bio}</h3>
                         <span className={`text-xs font-bold ${localUser.bio.length >= MAX_BIO_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>{localUser.bio.length}/{MAX_BIO_LENGTH}</span>
                     </div>
                     <textarea value={localUser.bio} onChange={handleBioChange} placeholder={TRANSLATIONS[lang].bio_placeholder} maxLength={MAX_BIO_LENGTH} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all text-gray-700 min-h-[100px] resize-none" />
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-gray-800 font-bold text-lg">{TRANSLATIONS[lang].my_photos}</h3>
                        <span className="text-xs text-gray-400 font-medium">{localUser.customPhotos.length}/4</span>
                     </div>
                     <div className="grid grid-cols-3 gap-3">
                         {renderPhotoSlots()}
                     </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-800 font-bold text-lg mb-4">{TRANSLATIONS[lang].my_identity}</h3>
                    <div className="flex gap-2">
                        {[Gender.MALE, Gender.FEMALE, Gender.OTHER].map(g => (
                            <button key={g} onClick={() => updateLocal({ gender: g })} className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition-colors ${localUser.gender === g ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                                {g === Gender.MALE ? TRANSLATIONS[lang].gender_man : g === Gender.FEMALE ? TRANSLATIONS[lang].gender_woman : TRANSLATIONS[lang].gender_other}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-800 font-bold text-lg mb-4">{TRANSLATIONS[lang].discovery_settings}</h3>
                    <div className="mb-6">
                        <p className="text-sm text-gray-500 font-bold mb-3 uppercase tracking-wider">{TRANSLATIONS[lang].looking_for}</p>
                        <div className="flex gap-2">
                             {[GenderPreference.MEN, GenderPreference.WOMEN, GenderPreference.ALL].map(p => (
                                <button key={p} onClick={() => updateLocal({ discoverySettings: { ...localUser.discoverySettings, genderPreference: p } })} className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition-colors ${localUser.discoverySettings.genderPreference === p ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                                    {p === GenderPreference.MEN ? TRANSLATIONS[lang].pref_men : p === GenderPreference.WOMEN ? TRANSLATIONS[lang].pref_women : TRANSLATIONS[lang].pref_all}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">{TRANSLATIONS[lang].age_range}</p>
                            <p className="text-pink-500 font-bold">{localUser.discoverySettings.ageRange[0]} - {localUser.discoverySettings.ageRange[1]}</p>
                        </div>
                        <div className="px-2 pb-2">
                            <DoubleRangeSlider min={18} max={90} value={localUser.discoverySettings.ageRange} onChange={(r) => updateLocal({ discoverySettings: { ...localUser.discoverySettings, ageRange: r } })} />
                        </div>
                    </div>
                </div>

                <Button onClick={onLogout} variant="ghost" className="text-red-500 hover:bg-red-50 w-full border border-red-100 mb-8">
                    {TRANSLATIONS[lang].logout}
                </Button>
            </div>
            
            <div className={`fixed bottom-24 lg:bottom-10 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${isLocalDirty ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                <button onClick={handleSaveClick} className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-transform flex items-center gap-2">
                    <span>{TRANSLATIONS[lang].save_changes}</span>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" /></svg>
                </button>
            </div>
            <Footer onContact={onContact} onLegal={onLegal} onPrivacy={onPrivacy} lang={lang} variant="dark" />
        </div>
    );
};

export default Profile;