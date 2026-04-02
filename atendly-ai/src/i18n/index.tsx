import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import ptBR from './pt-BR.json';
import en from './en.json';

type Language = 'pt-BR' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const translations = {
  'pt-BR': ptBR,
  'en': en,
};

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('atendly-language') as Language) || 'pt-BR';
    }
    return 'pt-BR';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('atendly-language', language);
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string): string => {
    const translation = translations[language];
    return translation[key as keyof typeof translation] || key;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
