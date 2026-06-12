import { Linter } from 'eslint';

const absoluteImportPathRule: Linter.RulesRecord = {
  'no-restricted-imports': [
    'error',
    {
      patterns: ['./*', '../*'],
    },
  ],
};

export default absoluteImportPathRule;
