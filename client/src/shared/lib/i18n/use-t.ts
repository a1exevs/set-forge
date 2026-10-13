import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { DEFAULT_LANGUAGE, isLanguage, type Language } from './languages';

/** The translate function a logic layer passes to its presentation. */
export type Translate = TFunction;

/** Re-renders the caller when the language changes, so every screen follows a switch at once. */
export const useT = (): { t: Translate; language: Language } => {
  const { t, i18n } = useTranslation();
  return { t, language: isLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE };
};
