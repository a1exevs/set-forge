export const TESTS_DIR_NAME = 'specs';
export const COVERAGE_DIR_NAME = '.coverage';

/** FSD aliases: a slice (`@entities/session`) or a shared segment (`@shared/ui`) — layers have no public API. */
export const PATH_ALIASES_MAP = {
  '^@(pages|widgets|features|entities|shared)/(.*)$': '<rootDir>/src/$1/$2',
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
