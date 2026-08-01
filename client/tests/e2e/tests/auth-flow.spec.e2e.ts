import { expect, test } from '@playwright/test';
import { randomUUID } from 'crypto';

import { E2E_SERVER_ORIGIN } from 'tests/e2e/stack/ports';

test.describe('Auth register and login', () => {
  test('registers a new user and lands on home', async ({ page }) => {
    const email = `e2e-${randomUUID()}@example.com`;
    const password = '12345678';

    await page.goto('/register');

    await page.locator('#auth-email').fill(email);
    await page.locator('#auth-password').fill(password);
    await page.getByRole('checkbox', { name: /consent to the processing/i }).check();
    await page.getByRole('checkbox', { name: /accept the/i }).check();
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Workout lists', { exact: true })).toBeVisible();
    await expect(page.getByText('No workout lists yet')).toBeVisible();
  });

  test('logs in an existing user', async ({ page, request }) => {
    const email = `e2e-login-${randomUUID()}@example.com`;
    const password = '12345678';

    // Seed via API so this scenario only covers the login UI path.
    const registerResponse = await request.post(`${E2E_SERVER_ORIGIN}/api/1.0/auth/registration`, {
      data: { email, password, consent: true, termsAccepted: true },
    });
    expect(registerResponse.ok()).toBeTruthy();

    await page.goto('/login');
    await page.locator('#auth-email').fill(email);
    await page.locator('#auth-password').fill(password);
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Workout lists', { exact: true })).toBeVisible();
  });
});
