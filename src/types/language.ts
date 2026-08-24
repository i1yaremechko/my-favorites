export type Language = 'uk' | 'en';

export const LANGUAGES: Language[] = ['uk', 'en'];

export const LANGUAGE_LABELS: Record<Language, string> = {
  uk: 'UA',
  en: 'EN',
};

// TMDB locale codes for each supported language.
export const TMDB_LOCALES: Record<Language, string> = {
  uk: 'uk-UA',
  en: 'en-US',
};
