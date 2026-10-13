/** Every supported interface language, named in itself. A new language is a dictionary plus an entry here. */
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
] as const;

export type Language = (typeof LANGUAGES)[number]['code'];

export const DEFAULT_LANGUAGE: Language = 'en';

const LANGUAGE_CODES: ReadonlySet<string> = new Set(LANGUAGES.map(language => language.code));

export const isLanguage = (value: unknown): value is Language => typeof value === 'string' && LANGUAGE_CODES.has(value);
