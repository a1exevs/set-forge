import { DEFAULT_LANGUAGE, isLanguage, type Language } from './languages';

/** The first preferred browser language decides; one we do not support falls back to the default. */
export const detectLanguage = (preferred: readonly string[]): Language => {
  const primary = preferred[0]?.split('-')[0]?.toLowerCase();
  return isLanguage(primary) ? primary : DEFAULT_LANGUAGE;
};
