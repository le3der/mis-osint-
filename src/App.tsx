import React, { useState } from 'react';
import { SlideViewer } from './components/SlideViewer';
import { CyberLab } from './components/CyberLab';
import { Dashboard } from './components/Dashboard';
import { LanguageProvider, useLanguage } from './lib/LanguageContext';
import { GameProvider } from './lib/GameContext';
import { Volume2, VolumeX, Globe } from 'lucide-react';
import { cn } from './lib/utils';
import { Analytics } from '@vercel/analytics/react';

function FloatingControls() {
  const { lang, setLang, audioMuted, toggleAudio, isRtl } = useLanguage();
  return (
    <div className={cn("fixed top-6 z-50 flex items-center gap-1 p-1 bg-[#0a0f16]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-indigo-500/10", isRtl ? "left-6" : "right-6")}>
      <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="text-slate-300 hover:text-white hover:bg-white/5 p-2 px-4 rounded-full transition-all flex items-center gap-2 text-xs font-bold tracking-wide">
        <Globe className="w-4 h-4 text-indigo-400" />
        {lang === 'en' ? 'عربي' : 'EN'}
      </button>
      <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
      <button onClick={toggleAudio} className="text-slate-300 hover:text-white hover:bg-white/5 p-2 px-3 pr-4 rounded-full transition-all flex items-center justify-center">
        {audioMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
      </button>
    </div>
  );
}

function MainApp() {
  const [view, setView] = useState<'landing' | 'report' | 'simulation'>(() => {
    return (localStorage.getItem('cyberlab_view') as any) || 'landing';
  });

  const handleSetView = (v: 'landing' | 'report' | 'simulation') => {
    setView(v);
    localStorage.setItem('cyberlab_view', v);
  };

  return (
    <>
      <FloatingControls />
      {view === 'report' && <SlideViewer onExit={() => handleSetView('landing')} />}
      {view === 'simulation' && <CyberLab onExit={() => handleSetView('landing')} />}
      {view === 'landing' && <Dashboard setView={handleSetView} />}
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <GameProvider>
        <MainApp />
        <Analytics />
      </GameProvider>
    </LanguageProvider>
  );
}

