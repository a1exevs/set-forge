import { Linter } from 'eslint';

const importOrderRule: Linter.RulesRecord = {
  'import/order': [
    'error',
    {
      alphabetize: {
        caseInsensitive: true,
        order: 'asc',
      },
      groups: [
        ['builtin', 'external', 'object', 'type'],
        ['internal', 'parent', 'sibling', 'index'],
      ],
      'newlines-between': 'always',
    },
  ],
};

export default importOrderRule;
