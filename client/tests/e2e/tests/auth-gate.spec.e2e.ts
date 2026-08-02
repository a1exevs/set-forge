import { expect, test } from '@playwright/test';

test.describe('Auth gate', () => {
  test('redirects home to login when there is no session', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Set Forge' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible();
  });
});
