import { rootDir } from './common';

const settings: Record<string, unknown> = {
  // Lets eslint-plugin-import parse imported .ts files — without it `import/no-cycle` silently sees no graph.
  'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
  'import/extensions': ['.ts', '.tsx', '.js', '.mjs'],
  'import/resolver': {
    typescript: {
      alwaysTryTypes: true,
      project: rootDir,
    },
  },
  'import/internal-regex': '^(@(pages|widgets|features|entities|shared)/|src/)',
};

export default settings;
