import React from 'react';
import { Button } from './Button';
import { TRANSLATIONS } from '../constants';
import type { Language } from '../types';

const UnsavedChangesModal = ({ 
    onSave, 
    onDiscard, 
    onCancel, 
    lang 
}: { 
    onSave: () => void, 
    onDiscard: () => void, 
    onCancel: () => void, 
    lang: Language 
}) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-fade-in-up text-center">
             <div className="w-16 h-16 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M13,14H11V9H13M13,18H11V16H13M1,21H23L12,2L1,21Z" /></svg>
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">{TRANSLATIONS[lang].unsaved_title}</h3>
             <p className="text-gray-500 mb-6">{TRANSLATIONS[lang].unsaved_message}</p>
             
             <div className="flex flex-col gap-3">
                 <Button onClick={onSave} variant="primary" fullWidth>{TRANSLATIONS[lang].save_changes}</Button>
                 <Button onClick={onDiscard} variant="secondary" fullWidth className="text-red-500 border-red-100 hover:bg-red-50">{TRANSLATIONS[lang].discard}</Button>
                 <Button onClick={onCancel} variant="ghost" fullWidth>{TRANSLATIONS[lang].cancel}</Button>
             </div>
        </div>
    </div>
);

export default UnsavedChangesModal;