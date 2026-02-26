import { expect } from '@playwright/test';

import { e2eTest } from 'tests/e2e/config/context';

e2eTest.describe('Site page', () => {
  e2eTest('should have correct title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Set Forge - Workout Tracker');
  });
});
