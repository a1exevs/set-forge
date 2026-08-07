import eslintJs from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import tsEslint from 'typescript-eslint';

import languageOptions from './linter/language-options';
import plugins from './linter/plugins';
import absoluteImportPathRule from './linter/rules/absolute-import-path-rule';
import curlyRule from './linter/rules/curly-rule';
import importOrderRule from './linter/rules/import-order-rule';
import sortImportsRule from './linter/rules/sort-imports-rule';
import unusedVarsRule from './linter/rules/unused-vars-rule';
import settings from './linter/settings';

export default tsEslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'database/**', '_stub/**'],
  },
  eslintJs.configs.recommended,
  tsEslint.configs.recommended,
  tsEslint.configs.strict,
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
      ...curlyRule,
      'no-console': 'error',
    },
  },
  {
    // source files
    files: ['src/**/*.ts'],
    rules: {
      'eslint-plugin-tsdoc/syntax': 'error',
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      '@typescript-eslint/no-useless-constructor': 'off',
      '@typescript-eslint/no-empty-function': ['error', { allow: ['constructors'] }],
      // TODO: enable @typescript-eslint/no-explicit-any (align with client strict)
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      // TODO: enable @typescript-eslint/no-unsafe-function-type (replace Function in Nest pipes/decorators)
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },
  {
    // unit / e2e tests
    files: ['src/**/*.spec.ts', 'test/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off',
      // TODO: enable @typescript-eslint/no-explicit-any in tests after typing cleanup
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
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
);
