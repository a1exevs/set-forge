export const TESTS_DIR_NAME = 'specs';
export const COVERAGE_DIR_NAME = '.coverage';

export const PATH_ALIASES_MAP = {
  '^@app$': '<rootDir>/src/app',
  '^@app/(.*)$': '<rootDir>/src/app/$1',
  '^@pages$': '<rootDir>/src/pages',
  '^@pages/(.*)$': '<rootDir>/src/pages/$1',
  '^@widgets$': '<rootDir>/src/widgets',
  '^@widgets/(.*)$': '<rootDir>/src/widgets/$1',
  '^@features$': '<rootDir>/src/features',
  '^@features/(.*)$': '<rootDir>/src/features/$1',
  '^@entities$': '<rootDir>/src/entities',
  '^@entities/(.*)$': '<rootDir>/src/entities/$1',
  '^@shared$': '<rootDir>/src/shared',
  '^@shared/(.*)$': '<rootDir>/src/shared/$1',
} as const;

export const MAIN_MODULES_MAP = {
  'src/(.*)$': '<rootDir>/src/$1',
  'tests/(.*)$': '<rootDir>/tests/$1',
} as const;

export const MOCK_FILES_MODULES_MAP = {
  '^.*[.](gif|ttf|eot|svg|png|jpg|jpeg|webp)$': '<rootDir>/tests/__mocks__/file-mock.ts',
} as const;

export const MOCK_STYLES_MODULES_MAP = {
  '^.*[.](css|scss|less)$': 'identity-obj-proxy',
} as const;

export const UNIT_TESTS_POSTFIX = 'spec.unit';
export const UNIT_TESTS_COVERAGE_DIR_NAME = 'unit-tests';

export const SNAPSHOT_TESTS_POSTFIX = 'spec.snap';
export const SNAPSHOT_TESTS_COVERAGE_DIR_NAME = 'snap-tests';
