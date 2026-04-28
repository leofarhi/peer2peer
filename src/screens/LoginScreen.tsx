import React from 'react';
import { Button } from '../components/Button';
import Footer from '../components/Footer';
import { Icons, TRANSLATIONS } from '../constants';
import type { Language } from '../types';

const LoginScreen = ({ onLogin, onContact, onLegal, onPrivacy, lang }: { onLogin: () => void, onContact: () => void, onLegal: () => void, onPrivacy: () => void, lang: Language }) => (  <div className="min-h-screen w-full fruit-gradient flex flex-col items-center p-6 text-white relative overflow-hidden">
    
    <div className="absolute top-10 left-10 md:left-1/4 opacity-20 transform -rotate-12 scale-150 animate-pulse">
       <Icons.Shield />
    </div>
    <div className="absolute bottom-20 right-10 md:right-1/4 opacity-20 transform rotate-45 scale-150 animate-bounce delay-700">
       <Icons.Lightning />
    </div>

    <div className="flex-1 flex flex-col justify-center items-center w-full max-w-md z-10 animate-fade-in-up">
      <div className="w-full text-center space-y-8">
        <div className="bg-white/20 p-8 rounded-[2rem] backdrop-blur-md shadow-2xl border border-white/30">
          <h1 className="text-6xl font-extrabold mb-4 drop-shadow-md tracking-tight">Peer2Peer</h1>
          <p className="text-xl font-medium opacity-90 tracking-widest uppercase">EXCLUSIVE FOR 42 STUDENTS</p>
        </div>
        
        <div className="space-y-6 pt-6">
          <p className="text-lg leading-relaxed font-light">
            {TRANSLATIONS[lang].login_subtitle}
          </p>
          <Button onClick={onLogin} variant="secondary" fullWidth className="text-xl py-4 shadow-xl hover:scale-105 transition-transform">
            {TRANSLATIONS[lang].login_btn}
          </Button>
          <p className="text-xs opacity-60 font-mono">{TRANSLATIONS[lang].login_secure}</p>
        </div>
      </div>
    </div>

    <div className="z-10 w-full shrink-0 pb-4">
        <Footer onContact={onContact} onLegal={onLegal} onPrivacy={onPrivacy} lang={lang} variant="light" />
    </div>
  </div>
);

export default LoginScreen;