import { test } from '@playwright/test';

type E2ETest = Record<string, unknown>;

export const e2eTest = test.extend<E2ETest>({
  headless: false,
});
