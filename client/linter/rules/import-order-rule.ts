import { Linter } from 'eslint';

const importOrderRule: Linter.RulesRecord = {
  'import/order': [
    'error',
    {
      alphabetize: {
        caseInsensitive: true,
        order: 'asc',
      },
      // packages → other slices/layers (`@entities/session`) → own slice (relative)
      groups: [['builtin', 'external', 'object'], 'internal', ['parent', 'sibling', 'index']],
      'newlines-between': 'always',
      pathGroups: [
        {
          pattern: '@{pages,widgets,features,entities,shared}/**',
          group: 'internal',
          position: 'after',
        },
        {
          pattern: 'src/**',
          group: 'internal',
          position: 'after',
        },
      ],
      pathGroupsExcludedImportTypes: ['builtin', 'external'],
    },
  ],
  'import/newline-after-import': 'error',
};

export default importOrderRule;
