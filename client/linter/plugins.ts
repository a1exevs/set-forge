import { ESLint } from 'eslint';
// @ts-ignore importPlugin doesn't have @types support
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import tsDocPlugin from 'eslint-plugin-tsdoc';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

// Annotated: `composite` (tsconfig.linter.json) emits declarations, and the inferred type names types the
// plugins do not export.
const plugins: Record<string, ESLint.Plugin> = {
  'eslint-plugin-tsdoc': tsDocPlugin,
  prettier: prettierPlugin,
  import: importPlugin,
  'unused-imports': unusedImportsPlugin,
};

export default plugins;
