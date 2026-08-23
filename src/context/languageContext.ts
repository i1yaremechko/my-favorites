import { createContext } from 'react';

import type { TranslationKey } from '@/i18n/translations';
import type { Language } from '@/types/language';

export interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);
