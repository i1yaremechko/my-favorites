import { useCallback, useMemo, useState } from 'react';

import { translations, type TranslationKey } from '@/i18n/translations';
import { LANGUAGES, type Language } from '@/types/language';

import { LanguageContext } from './languageContext';

const STORAGE_KEY = 'my-favorite:language';

const isLanguage = (value: string | null): value is Language =>
  !!value && (LANGUAGES as string[]).includes(value);

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'uk';

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (isLanguage(stored)) return stored;

  const browserLang = window.navigator.language?.toLowerCase() ?? '';
  return browserLang.startsWith('uk') ? 'uk' : 'en';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch { }
  }, []);

  const t = useCallback((key: TranslationKey) => translations[key][language], [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};