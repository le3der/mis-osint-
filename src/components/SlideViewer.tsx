import React from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { ArrowLeft } from 'lucide-react';

export function SlideViewer({ onExit }: { onExit: () => void }) {
  const { isRtl } = useLanguage();

  return (
    <div className="flex flex-col h-screen w-full bg-[#05080f] overflow-hidden relative">
      <div className="absolute top-6 z-[999]" style={{ [isRtl ? 'right' : 'left']: '24px' }}>
        <button 
          onClick={onExit} 
          className="p-2 text-slate-300 hover:text-white bg-[#0a0f16]/80 hover:bg-white/10 rounded-full transition-all shadow-2xl border border-white/10 backdrop-blur-xl flex items-center justify-center w-12 h-12"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      <iframe 
        src="/advisory.html" 
        className="w-full h-full border-none"
        title="Security Advisory"
      />
    </div>
  );
}
