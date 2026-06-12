import type { Page, Route } from '@playwright/test';

const unauthenticatedRefreshBody = JSON.stringify({
  data: null,
  messages: [],
  fieldsErrors: [],
  resultCode: 1,
});

export async function mockUnauthenticatedSession(page: Page): Promise<void> {
  await page.route('**/api/1.0/auth/refresh', async (route: Route) => {
    await route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: unauthenticatedRefreshBody,
    });
  });
}
