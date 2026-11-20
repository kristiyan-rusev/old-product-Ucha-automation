import { test, expect } from '@playwright/test';
import { users } from '../../test-data/credentials';
import { logIn } from '../../utils/accounts';
import { BasePage } from '../../pages/BasePage';

// Same account in two browsers (staging checklist row 14), on the shared student — the test changes nothing (a
// logout only ends that browser's session). It relies on the shared student having no subscription (it would
// otherwise hit device verification and fail at the first login). Checked live 2026-10-29 with an account that has
// no subscription: the second login does NOT end the first session, and logging out in one browser leaves the
// other one logged in. (Accounts with a subscription keep only their last three devices and ask for a
// verification code on a new one — that needs a purchase and is not covered here.)
// Browser B is a second browser context (its own cookies, like a second browser). In UI mode tick
// "Show browser" to see it open as its own window.
test.describe('Login — the same account in two browsers', () => {
  test('both sessions stay logged in, and logging out in one leaves the other', { tag: ['@story', '@checklist'] }, async ({ page, browser }, testInfo) => {
    test.setTimeout(300_000);
    const browserA = new BasePage(page);
    let email = '';
    let password = '';

    await test.step('Browser A: the shared student logs in', async () => {
      ({ email, password } = users.student);
      expect(await logIn(page, email, password)).toBe(true);
      await page.goto('/profile/');
      await expect(page).toHaveURL(/\/profile\/$/);
    });

    const contextB = await browser.newContext({ baseURL: testInfo.project.use.baseURL });
    try {
      const pageB = await contextB.newPage();
      const browserB = new BasePage(pageB);

      await test.step('Browser B: the same account logs in too', async () => {
        expect(await logIn(pageB, email, password)).toBe(true);
        await pageB.goto('/profile/');
        await expect(pageB).toHaveURL(/\/profile\/$/);
      });

      await test.step('Browser A: still logged in after B logged in', async () => {
        await page.goto('/profile/settings/');
        await expect(page).toHaveURL(/\/profile\/settings\/$/);
        await page.goto('/');
        await expect(browserA.userNavToggler).toBeVisible();
      });

      await test.step('Browser B: logs out with the logout button; /profile/ then asks to log in', async () => {
        await browserB.logout();
        await expect(browserB.loginLink).toBeVisible();
        await expect(browserB.userNavToggler).toHaveCount(0);
        await pageB.goto('/profile/');
        await expect(pageB).toHaveURL(/\/login\/?$/);
      });

      await test.step('Browser A: still logged in after B logged out', async () => {
        await page.goto('/profile/');
        await expect(page).toHaveURL(/\/profile\/$/);
      });
    } finally {
      await contextB.close();
    }
  });
});
