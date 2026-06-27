import { expect, test } from '@playwright/test';

test.describe('Site page', () => {
  test('should have correct title on login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle('Set Forge — Workout Planner & Strength Training Tracker');
    await expect(page.getByRole('heading', { name: 'Set Forge' })).toBeVisible();
  });
});
