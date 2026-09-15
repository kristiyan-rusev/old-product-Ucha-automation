import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { ProfileSettingsPage } from '../../pages/ProfileSettingsPage';
import { LoginPage } from '../../pages/LoginPage';
import { uniqueTestEmail } from '../../test-data/credentials';
import { logCreatedAccount } from '../../utils/testAccountLog';
import { fetchRegistrationConfirmationLink } from '../../utils/fetchConfirmationLink';

// Fully end-to-end, using a dedicated throwaway account — never the shared
// student/parent/teacher accounts other tests depend on, since this permanently
// deactivates whatever account it runs against.
//
// The documentation (UCHAdocumentation.md) describes deactivation as disabled
// ("Временно нямаш възможност да деактивираш профила си...") — that's outdated, the
// feature is live. The real flow: click "Деактивирай профила си" -> SMS verification
// (111111 is the dev-environment bypass code) -> "why are you leaving" reason poll ->
// re-enter password -> POST /profile/edit/delete/edit -> redirected to /login/, and the
// account can no longer log in (same generic wrong-credentials message as any other
// failed login — there's no distinct "this account is deactivated" message).
test.describe('Account deactivation', () => {
  test('deactivating an account through the real flow prevents further login', async ({ page }, testInfo) => {
    test.setTimeout(120_000);

    const email = uniqueTestEmail('deactivate');
    const password = 'TestPass123!';

    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
    await registrationPage.registerStudent({
      username: 'QADeactivateTest',
      phone: '888123456',
      email,
      password,
      grade: '7',
      city: 'София',
    });
    await registrationPage.submit();
    logCreatedAccount(email, testInfo.project.name);
    await expect(page).toHaveURL(/\/registration\/success\/$/);

    const confirmationLink = await fetchRegistrationConfirmationLink(email);
    await page.goto(confirmationLink);
    await expect(registrationPage.confirmationCompleteHeading).toBeVisible();

    const loginPage = new LoginPage(page);
    await page.goto('/login/');
    await loginPage.login(email, password);
    await expect(page).toHaveURL('/');

    const settingsPage = new ProfileSettingsPage(page);
    await settingsPage.goto();
    await settingsPage.startDeactivation();
    await settingsPage.verifyWithCode('111111');
    await settingsPage.submitReason(1);
    await settingsPage.confirmDeactivation(password);
    await expect(page).toHaveURL(/\/login\/$/);

    // The account should no longer be able to log in.
    await loginPage.login(email, password);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/\/login\/$/);
  });
});
