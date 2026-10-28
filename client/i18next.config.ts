import { defineConfig } from 'i18next-cli';

import { LANGUAGES } from './src/shared/lib/i18n/languages';

// The dictionary checks of `npm run lint:i18n`: every key used in code exists in every language, and every key of a
// dictionary is used. English is the reference; `src/app/i18n/dictionaries.ts` loads the same files.
export default defineConfig({
  locales: LANGUAGES.map(language => language.code),
  extract: {
    input: ['src/**/*.{ts,tsx}'],
    ignore: ['src/**/specs/**', 'src/**/*.stories.tsx', 'src/app/router/route-tree.gen.ts'],
    // One file per language, no namespace level inside: the shape `dictionaries.ts` loads.
    output: 'src/app/i18n/{{language}}.json',
    defaultNS: false,
    primaryLanguage: 'en',
    functions: ['t'],
    useTranslationNames: ['useT'],
    extractFromComments: false,
  },
});
