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
      pathGroups: [
        {
          pattern: '@{assets,auth,common,logger,roles,root,security,src,test,users,workout-lists,workout-sessions}/**',
          group: 'internal',
          position: 'after',
        },
      ],
      pathGroupsExcludedImportTypes: ['builtin', 'external'],
    },
  ],
};

export default importOrderRule;
