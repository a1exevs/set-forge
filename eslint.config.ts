import eslintJs from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import storyBookPlugin from 'eslint-plugin-storybook';
import tsEslint from 'typescript-eslint';

import languageOptions from './linter/language-options';
import plugins from './linter/plugins';
import absoluteImportPathRule from './linter/rules/absolute-import-path-rule';
import importOrderRule from './linter/rules/import-order-rule';
import sortImportsRule from './linter/rules/sort-imports-rule';
import unusedVarsRule from './linter/rules/unused-vars-rule';
import settings from './linter/settings';

export default tsEslint.config(
  {
    ignores: ['src/route-tree.gen.ts'],
  },
  eslintJs.configs.recommended,
  tsEslint.configs.recommended,
  tsEslint.configs.strict,
  ...storyBookPlugin.configs['flat/recommended'],
  prettierConfig,
  {
    languageOptions,
    settings,
    plugins,
    rules: {
      ...unusedVarsRule,
      ...importOrderRule,
      ...sortImportsRule,
      ...absoluteImportPathRule,
      'no-console': 'error',
    },
  },
  {
    // sources files
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'eslint-plugin-tsdoc/syntax': 'error',
      '@typescript-eslint/no-this-alias': 'off',
    },
  },
  {
    // Tests config files
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    // linter config files
    files: ['linter/**/*.{ts,tsx}', 'eslint.config.ts'],
    rules: {
      'no-restricted-imports': 'off',
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
    },
  },
  {
    // Script files
    files: ['scripts/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
      'no-console': 'off',
    },
  },
);
