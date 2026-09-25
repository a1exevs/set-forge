import eslintJs from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import storyBookPlugin from 'eslint-plugin-storybook';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

import languageOptions from './linter/language-options';
import plugins from './linter/plugins';
import curlyRule from './linter/rules/curly-rule';
import { fsdImportsConfigs } from './linter/rules/fsd-imports-rule';
import importOrderRule from './linter/rules/import-order-rule';
import {
  modelTypeReaders,
  segmentDirectionRule,
  sharedModelTypeOnlyRule,
  sliceModelTypeOnlyRule,
} from './linter/rules/segment-direction-rule';
import sortImportsRule from './linter/rules/sort-imports-rule';
import { sharedUiRule, slicedUiRule } from './linter/rules/ui-segment-rule';
import unusedVarsRule from './linter/rules/unused-vars-rule';
import settings from './linter/settings';

export default tsEslint.config(
  {
    ignores: ['src/app/router/route-tree.gen.ts'],
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
      ...curlyRule,
      'no-console': 'error',
    },
  },
  {
    // sources files
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'eslint-plugin-tsdoc/syntax': 'error',
      '@typescript-eslint/no-this-alias': 'off',
      // No cycles at all — also catches a file importing its own slice's index.ts.
      'import/no-cycle': ['error', { ignoreExternal: true }],
      'import/no-self-import': 'error',
      // `interface` = domain entity, `type` = everything else (props, DTOs, params, unions, view models).
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      ...segmentDirectionRule(),
    },
  },
  {
    // Domain entities live in entity models — the only place `interface` is allowed.
    files: ['src/entities/*/model/**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },
  {
    // Declaration merging needs `interface`: module augmentation (`declare module '@tanstack/react-router'
    // { interface Register }`) and ambient globals (`interface ImportMeta` in vite-env.d.ts).
    files: ['src/app/router/router.ts', 'src/**/*.d.ts'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },
  {
    // api / lib / config → model: `import type` only.
    files: modelTypeReaders.map(segment => `src/{pages,widgets,features,entities}/*/${segment}/**/*.{ts,tsx}`),
    rules: sliceModelTypeOnlyRule,
  },
  {
    files: modelTypeReaders.map(segment => `src/shared/${segment}/**/*.{ts,tsx}`),
    rules: sharedModelTypeOnlyRule,
  },
  // FSD import boundaries: layers, slices, public API, `@x`, UI kit / React Query placement.
  ...fsdImportsConfigs(),
  {
    // A `ui` segment holds components only: constants → config/, types and logic → model/, helpers → lib/.
    files: ['src/{pages,widgets,features,entities}/*/ui/**/*.{ts,tsx}'],
    ignores: ['src/**/specs/**', 'src/**/*.stories.tsx'],
    rules: slicedUiRule,
  },
  {
    files: ['src/shared/ui/**/*.{ts,tsx}'],
    ignores: ['src/**/specs/**', 'src/**/*.stories.tsx', 'src/shared/ui/index.ts'],
    rules: sharedUiRule,
  },
  {
    // Tests config files
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    // Playwright webServer bootstrap (Node CJS)
    files: ['tests/**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // linter config files
    files: ['linter/**/*.{ts,tsx}', 'eslint.config.ts', 'steiger.config.ts'],
    rules: {
      'no-restricted-imports': 'off',
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
    },
  },
);
