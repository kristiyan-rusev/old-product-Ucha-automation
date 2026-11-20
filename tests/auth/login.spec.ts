import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { users } from '../../test-data/credentials';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('valid credentials — successful login redirects to home', { tag: '@checklist' }, async ({ page }) => {
    await loginPage.login(users.student.email, users.student.password);
    await expect(page).toHaveURL('/');
  });

  // The server returns the same generic message for any wrong email/phone+password
  // combination, empty fields included — there is no separate "invalid format" message.
  test('invalid password — shows generic error', async () => {
    await loginPage.login(users.student.email, 'wrongpassword');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Грешен имейл/телефон за вход или парола. Опитай отново!');
  });

  test('unknown email/phone — shows generic error', async () => {
    await loginPage.login('notarealuser@example.com', 'somepassword');
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('empty fields — shows generic error', async () => {
    await loginPage.submit();
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
