import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { BasePage } from '../../pages/BasePage';
import { users } from '../../test-data/credentials';

test.describe('Logout', () => {
  let loginPage: LoginPage;
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    basePage = new BasePage(page);
    await loginPage.goto();
    await loginPage.login(users.student.email, users.student.password);
    await expect(page).toHaveURL('/');
  });

  test('logging out from the home page returns to a logged-out state', async () => {
    await basePage.logout();

    await expect(basePage.loginLink).toBeVisible();
    await expect(basePage.registerLink).toBeVisible();
    await expect(basePage.userNavToggler).toHaveCount(0);
  });

  test('logging out from another page also works', async ({ page }) => {
    await page.goto('/videos/');
    await basePage.logout();

    await expect(basePage.loginLink).toBeVisible();
    await expect(basePage.userNavToggler).toHaveCount(0);
  });
});
