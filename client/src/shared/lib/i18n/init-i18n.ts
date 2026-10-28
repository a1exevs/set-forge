import i18next, { type ResourceLanguage } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { useLanguageStore } from './language-store';
import { DEFAULT_LANGUAGE, type Language, LANGUAGES } from './languages';

export type Dictionaries = Record<Language, ResourceLanguage>;

/** Starts i18next in the stored (or detected) language with the given dictionaries. */
export const initI18n = (dictionaries: Dictionaries): void => {
  void i18next.use(initReactI18next).init({
    resources: dictionaries,
    lng: useLanguageStore.getState().language,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: LANGUAGES.map((language: (typeof LANGUAGES)[number]) => language.code),
    initAsync: false,
    interpolation: { escapeValue: false },
  });
};
