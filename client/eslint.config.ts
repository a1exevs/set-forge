import eslintJs from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import storyBookPlugin from 'eslint-plugin-storybook';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

import languageOptions from './linter/language-options';
import plugins from './linter/plugins';
import curlyRule from './linter/rules/curly-rule';
import { fsdImportsConfigs } from './linter/rules/fsd-imports-rule';
import importOrderRule from './linter/rules/import-order-rule';
import returnTypeRule, { jsxCallbackSelectors } from './linter/rules/return-type-rule';
import {
  modelTypeReaders,
  segmentDirectionRule,
  sharedModelTypeOnlyRule,
  sliceModelTypeOnlyRule,
} from './linter/rules/segment-direction-rule';
import sortImportsRule from './linter/rules/sort-imports-rule';
import { uiLayerFiles, uiRule } from './linter/rules/ui-segment-rule';
import unusedVarsRule from './linter/rules/unused-vars-rule';
import settings from './linter/settings';

export default defineConfig(
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
      ...returnTypeRule,
      'no-console': 'error',
    },
  },
  {
    // component-typing: typed inline JSX callbacks. The ui blocks below repeat these selectors (flat config replaces
    // `no-restricted-syntax` options per block).
    files: ['**/*.tsx'],
    rules: { 'no-restricted-syntax': ['error', ...jsxCallbackSelectors] },
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
  // A `ui` segment holds components only (constants → config/, types and logic → model/, helpers → lib/);
  // presentation files take props only, hooks live in the logic / data layers (component-architecture).
  ...[false, true].flatMap(shared => {
    const uiDir = shared ? 'src/shared/ui' : 'src/{pages,widgets,features,entities}/*/ui';
    const ignores = ['src/**/specs/**', 'src/**/*.stories.tsx', 'src/shared/ui/index.ts'];
    const layerFiles = [...uiLayerFiles.logic, ...uiLayerFiles.data];
    return [
      {
        files: [`${uiDir}/**/*.{ts,tsx}`],
        ignores: [...ignores, ...layerFiles],
        rules: uiRule({ shared, kind: 'presentation' }),
      },
      ...(['logic', 'data'] as const).map(kind => ({
        files: uiLayerFiles[kind].map(pattern => `${uiDir}/${pattern}`),
        ignores,
        rules: uiRule({ shared, kind }),
      })),
    ];
  }),
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
      // Plain JS: no type annotations to write.
      '@typescript-eslint/explicit-function-return-type': 'off',
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
  {
    // Node CLI scripts (plain JavaScript): node globals, no TypeScript return types
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
);
