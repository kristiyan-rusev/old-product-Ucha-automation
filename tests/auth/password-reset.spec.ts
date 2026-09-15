import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { ResetPasswordPage } from '../../pages/ResetPasswordPage';
import { LoginPage } from '../../pages/LoginPage';
import { uniqueTestEmail } from '../../test-data/credentials';
import { logCreatedAccount } from '../../utils/testAccountLog';
import { fetchRegistrationConfirmationLink, fetchPasswordResetLink } from '../../utils/fetchConfirmationLink';

// Fully end-to-end, using a dedicated throwaway account rather than the shared
// student/parent/teacher test accounts — those have their passwords hardcoded in
// test-data/credentials.ts and other tests (e.g. login.spec.ts) depend on that staying
// fixed, so resetting one of those passwords here would break them.
test.describe('Password reset', () => {
  test('requesting a reset, following the emailed link, and setting a new password lets you log in with it', async ({
    page,
  }, testInfo) => {
    // Registration + two rounds of email polling (each up to 30s) + login easily exceeds
    // the default 30s test timeout.
    test.setTimeout(120_000);

    const email = uniqueTestEmail('reset');
    const originalPassword = 'TestPass123!';
    const newPassword = 'NewTestPass456!';

    // Register + confirm a fresh account to reset the password of.
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
    await registrationPage.registerStudent({
      username: 'QAResetTest',
      phone: '888123456',
      email,
      password: originalPassword,
      grade: '7',
      city: 'София',
    });
    await registrationPage.submit();
    logCreatedAccount(email, testInfo.project.name);
    await expect(page).toHaveURL(/\/registration\/success\/$/);

    const confirmationLink = await fetchRegistrationConfirmationLink(email);
    await page.goto(confirmationLink);
    await expect(registrationPage.confirmationCompleteHeading).toBeVisible();

    // Request the password reset.
    const resetPasswordPage = new ResetPasswordPage(page);
    await resetPasswordPage.goto();
    await resetPasswordPage.requestReset(email);
    await expect(resetPasswordPage.requestSuccessMessage).toBeVisible();
    await expect(resetPasswordPage.requestSuccessMessage).toContainText(email);

    // Follow the emailed link and set a new password.
    const resetLink = await fetchPasswordResetLink(email);
    await page.goto(resetLink);
    await resetPasswordPage.setNewPassword(newPassword);
    await expect(page).toHaveURL(/\/login\/$/);

    // Confirm the new password actually works.
    const loginPage = new LoginPage(page);
    await loginPage.login(email, newPassword);
    await expect(page).toHaveURL('/');
  });
});
