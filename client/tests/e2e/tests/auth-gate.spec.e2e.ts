import { expect, test } from '@playwright/test';

import { mockUnauthenticatedSession } from 'tests/e2e/helpers/auth-mocks';

test.describe('Auth gate', () => {
  test('redirects home to login when refresh has no session', async ({ page }) => {
    await mockUnauthenticatedSession(page);

    await page.goto('/');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Set Forge' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible();
  });
});
