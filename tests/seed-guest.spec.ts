import { test } from '@playwright/test';

// Starting point for the Playwright agents (see automation/AGENT_RULES.md): not logged in.
test.describe('Seed', () => {
  test('guest', async ({ page }) => {
    await page.goto('/');
    // generate code here.
  });
});
