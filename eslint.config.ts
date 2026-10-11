// Lints the files of the repository root: the scripts Node runs as they are and the lint-staged config. The client
// and the server keep their own configs (client/eslint.config.ts, server/eslint.config.ts).

import eslintJs from '@eslint/js';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['client/**', 'server/**', 'node_modules/**'],
  },
  eslintJs.configs.recommended,
  tsEslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node } },
    plugins: { import: importPlugin },
    rules: {
      curly: ['error', 'all'],
      'import/enforce-node-protocol-usage': ['error', 'always'],
    },
  },
  {
    // CommonJS configs that their tools load with require()
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
