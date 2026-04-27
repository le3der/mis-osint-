import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';
import { AudioService } from './audio';

type Lang = 'en' | 'ar';

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof translations.en) => string;
  isRtl: boolean;
  audioMuted: boolean;
  toggleAudio: () => void;
}

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const [audioMuted, setAudioMuted] = useState(true);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: keyof typeof translations.en) => {
    if (!translations[lang] || !translations[lang][key]) return translations['en'][key] || key;
    return translations[lang][key];
  };

  const toggleAudio = () => {
    const muted = AudioService.toggleMute();
    setAudioMuted(muted);
  };

  const isRtl = lang === 'ar';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRtl, audioMuted, toggleAudio }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
