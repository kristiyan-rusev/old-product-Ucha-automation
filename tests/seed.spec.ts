import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { users } from '../test-data/credentials';

// Starting point for the Playwright agents (see automation/AGENT_RULES.md): logged in as the
// shared student. For looking around only — flows that change account state need a fresh
// account (utils/registerAndLogin.ts). Not logged in: tests/seed-guest.spec.ts.
test.describe('Seed', () => {
  test('logged-in student', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.student.email, users.student.password);
    // generate code here.
  });
});
