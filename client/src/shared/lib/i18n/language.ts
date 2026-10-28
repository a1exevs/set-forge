import type { Language } from './languages';

export type LanguageState = {
  language: Language;
  setLanguage: (language: Language) => void;
};
