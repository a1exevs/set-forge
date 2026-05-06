import { expect, test } from '@playwright/test';

test.describe('Auth gate', () => {
  test('redirects home to login when refresh has no session', async ({ page }) => {
    await page.route('**/auth/refresh', async route => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          data: null,
          messages: [],
          fieldsErrors: [],
          resultCode: 1,
        }),
      });
    });

    await page.goto('/');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Set Forge' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible();
  });
});
