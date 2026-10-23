import { Linter } from 'eslint';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import i18nextPlugin from 'eslint-plugin-i18next';

import { LITERAL_TEXT_BASELINE } from './literal-text-baseline';

/** Props and attributes that carry text a user reads or hears; every other attribute is technical. */
const TEXT_ATTRIBUTES = [
  'aria-(label|description|placeholder|roledescription|valuetext)',
  'alt',
  'title',
  'placeholder',
  'label',
  '[a-zA-Z]+(Label|Text|Title|Message|Description)',
];

/**
 * Not words to translate: digits, punctuation and symbols of any script (`·`, `→`, `—`, `…`, emoji), CONSTANT_CASE,
 * the brand. These replace the plugin's defaults, so they cover what the defaults did.
 */
const NOT_TEXT: (string | RegExp)[] = [/^[\p{N}\p{P}\p{S}\s]+$/u, '[A-Z_-]+', 'Set Forge'];

/**
 * Calls whose string arguments are never text: the plugin's defaults (an option replaces them, so they are repeated
 * here) and the field names and request paths of a form (`exerciseFieldPath(index, 'name')`,
 * `getServerFieldError('name')`) — getters and paths only, a setter takes text.
 */
const NOT_TEXT_CALLS = [
  'i18n(ext)?',
  't',
  'require',
  'addEventListener',
  'removeEventListener',
  'postMessage',
  'getElementById',
  'dispatch',
  'commit',
  'includes',
  'indexOf',
  'endsWith',
  'startsWith',
  '[a-zA-Z]+FieldPath',
  'get[a-zA-Z]*FieldError',
];

const SOURCES = ['src/**/*.{ts,tsx}'];
const EXEMPT = ['src/**/specs/**', 'src/**/*.stories.tsx', ...LITERAL_TEXT_BASELINE];

// A second instance of the core rule under its own name: `no-restricted-syntax` is configured per block by the FSD
// rules, and flat config replaces a rule's options per block — so the toast check would vanish there, and the
// baseline could not exempt it alone.
const noRestrictedSyntax = builtinRules.get('no-restricted-syntax');
if (!noRestrictedSyntax) {
  throw new Error('ESLint no longer ships no-restricted-syntax');
}
const toastTextPlugin = { rules: { 'no-literal': noRestrictedSyntax } };

/**
 * Interface text comes from the dictionaries (`t('…')`): a literal in JSX text, in a text attribute or in a toast
 * fails. Stories and tests are exempt; so are the files of the baseline until their screens are translated.
 */
export const literalTextConfigs = (): Linter.Config[] => [
  {
    files: SOURCES,
    ignores: EXEMPT,
    plugins: { i18next: i18nextPlugin },
    rules: {
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          'jsx-attributes': { include: TEXT_ATTRIBUTES },
          words: { exclude: NOT_TEXT },
          callees: { exclude: NOT_TEXT_CALLS },
          message: 'Interface text comes from the dictionaries — use `t(…)` (src/app/i18n)',
        },
      ],
    },
  },
  {
    files: SOURCES,
    ignores: EXEMPT,
    plugins: { 'toast-text': toastTextPlugin },
    rules: {
      'toast-text/no-literal': [
        'error',
        {
          selector: 'CallExpression[callee.name=/^toast(Error|Success)$/] > :matches(Literal, TemplateLiteral)',
          message: 'A toast shows translated text — pass `t(…)` (src/app/i18n)',
        },
      ],
    },
  },
];
