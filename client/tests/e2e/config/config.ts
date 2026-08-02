import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

import { rootDir } from 'tests/common/paths';
import { isCI } from 'tests/e2e/helpers/ci-helpers';
import { E2E_CLIENT_ORIGIN, E2E_CLIENT_PORT, E2E_HEALTH_URL, E2E_SERVER_ORIGIN } from 'tests/e2e/stack/ports';

/**
 * Full-stack Playwright e2e: ephemeral MySQL + Nest (:5101) + Vite (:5174).
 * See tests/e2e/stack/start-api-stack.cjs.
 */
export default defineConfig({
  testMatch: '**/*.spec.e2e.ts',
  testDir: path.resolve(rootDir, 'tests', 'e2e', 'tests'),
  fullyParallel: true,
  forbidOnly: isCI(),
  retries: isCI() ? 2 : 0,
  workers: isCI() ? 1 : undefined,
  reporter: 'html',
  timeout: 60_000,
  use: {
    baseURL: E2E_CLIENT_ORIGIN,
    headless: isCI(),
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  // Always start a fresh stack — reusing :5101/:5174 can attach to a stale Nest without this run's MySQL.
  webServer: [
    {
      command: 'node tests/e2e/stack/start-api-stack.cjs',
      url: E2E_HEALTH_URL,
      cwd: rootDir,
      reuseExistingServer: false,
      timeout: 300_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: `npx cross-env VITE_DEV_SERVER_PORT=${E2E_CLIENT_PORT} VITE_DEV_API_PROXY=${E2E_SERVER_ORIGIN} npm run dev`,
      url: E2E_CLIENT_ORIGIN,
      cwd: rootDir,
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
