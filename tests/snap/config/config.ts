/** @jest-config-loader ts-node */
import type { Config } from 'jest';
import path from 'path';

import {
  COVERAGE_DIR_NAME,
  MAIN_MODULES_MAP,
  MOCK_FILES_MODULES_MAP,
  MOCK_STYLES_MODULES_MAP,
  PATH_ALIASES_MAP,
  SNAPSHOT_TESTS_COVERAGE_DIR_NAME,
  SNAPSHOT_TESTS_POSTFIX,
  TESTS_DIR_NAME,
} from '../../common/consts';
import { rootDir } from '../../common/paths';

const setupTestsEnvPath = path.resolve(rootDir, 'tests', 'common', 'setup-tests-env.ts');
const setupTestingLibraryPath = path.resolve(rootDir, 'tests', 'common', 'setup-testing-library.ts');

const config: Config = {
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  rootDir,
  testRegex: `.*/${TESTS_DIR_NAME}/.*.${SNAPSHOT_TESTS_POSTFIX}.[jt]sx?$`,
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['/node_modules/(?!(@wavesurfer/react|wavesurfer.js)/)'],
  setupFiles: [setupTestsEnvPath],
  setupFilesAfterEnv: [setupTestingLibraryPath],
  transform: {
    '^.+\\.[jt]sx?$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
  },
  collectCoverageFrom: ['**/*.(j|t)sx'],
  coverageDirectory: `${COVERAGE_DIR_NAME}/${SNAPSHOT_TESTS_COVERAGE_DIR_NAME}`,
  moduleNameMapper: {
    ...PATH_ALIASES_MAP,
    ...MOCK_STYLES_MODULES_MAP,
    ...MOCK_FILES_MODULES_MAP,
    ...MAIN_MODULES_MAP,
  },
};

export default config;
