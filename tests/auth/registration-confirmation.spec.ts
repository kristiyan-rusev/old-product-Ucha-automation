import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { uniqueTestEmail } from '../../test-data/credentials';
import { logCreatedAccount } from '../../utils/testAccountLog';
import { fetchRegistrationConfirmationLink } from '../../utils/fetchConfirmationLink';

// Fully end-to-end: registers a real account, fetches the resulting "Активирай профила
// си в Уча.се" email via the Gmail API (OAuth2, read-only — see
// utils/fetchConfirmationLink.ts and scripts/get-gmail-refresh-token.ts), and confirms the
// account by visiting the real activation link decoded out of it. Activation links are
// single-use: revisiting one shows a different ("already active") state, so a fresh
// registration is needed for every run of this test.
test.describe('Registration confirmation', () => {
  test('clicking the emailed activation link confirms the account', async ({ page }, testInfo) => {
    const registrationPage = new RegistrationPage(page);
    const email = uniqueTestEmail('confirm');

    await registrationPage.goto();
    await registrationPage.registerStudent({
      username: 'QATestStudent',
      phone: '888123456',
      email,
      password: 'TestPass123!',
      grade: '7',
      city: 'София',
    });
    await registrationPage.submit();
    logCreatedAccount(email, testInfo.project.name);
    await expect(page).toHaveURL(/\/registration\/success\/$/);

    const confirmationLink = await fetchRegistrationConfirmationLink(email);
    await page.goto(confirmationLink);

    await expect(page.locator('#membership-content')).toHaveClass(/activation_success/);
    await expect(registrationPage.confirmationCompleteHeading).toBeVisible();
    await expect(registrationPage.confirmationCompleteHeading).toHaveText('Ти вече си част от Уча.се!');
  });
});
