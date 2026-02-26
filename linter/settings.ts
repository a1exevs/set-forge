import { rootDir } from './common';

const settings: Record<string, unknown> = {
  'import/resolver': {
    typescript: {
      alwaysTryTypes: true,
      project: rootDir,
    },
  },
};

export default settings;
