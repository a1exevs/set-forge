import type { ESLint, Linter } from 'eslint';

import commentLengthRule from './comment-length-rule.ts';

export const plugin: ESLint.Plugin = {
  meta: { name: '@set-forge/eslint-config' },
  rules: { 'comment-length': commentLengthRule },
};

/** Comment length limits for every file the including config lints (.claude/rules/code-comments.md). */
export const commentLengthConfigs = (): Linter.Config[] => [
  {
    plugins: { 'set-forge': plugin },
    rules: { 'set-forge/comment-length': 'error' },
  },
];
