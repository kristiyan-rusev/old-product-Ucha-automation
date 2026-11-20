import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { LoginPage } from '../../pages/LoginPage';
import { ResetPasswordPage } from '../../pages/ResetPasswordPage';
import { ProfileSettingsPage } from '../../pages/ProfileSettingsPage';
import { testAddress } from '../../test-data/credentials';
import { logCreatedAccount } from '../../utils/testAccountLog';
import { expectEmail, Emails } from '../../utils/mandrill';
import { deactivateLoggedIn, logIn, removeAccounts, removeLeftovers, TEST_PASSWORDS } from '../../utils/accounts';
import { unlogAccount } from '../../utils/testAccountLog';

// The whole life of one student account, as a story: one account per run instead of one per
// test, on the same two fixed addresses every time. The account is deactivated at the end — and
// if a step fails, cleanup deactivates whatever exists, so dev keeps no leftovers either way.
// Each step needs the one before it, so a failure stops the story there.
const email = testAddress('student-story');
const changedEmail = testAddress('student-story2');
const PASSWORD = TEST_PASSWORDS[0]; // at registration
const RESET_PASSWORD = TEST_PASSWORDS[1]; // after the emailed password reset
// After the password change in settings it's back to PASSWORD.

test.describe('Student account — from registration to deactivation', () => {
  test.beforeEach(async ({ browser, baseURL }) => {
    // Leftovers from an interrupted run would block registering the same address.
    await removeLeftovers(browser, baseURL!, [email, changedEmail]);
  });

  test.afterEach(async ({ browser, baseURL }, testInfo) => {
    // A passing story deactivated its account itself; after a failure, remove it the thorough way.
    if (testInfo.status !== 'passed') await removeAccounts(browser, baseURL!, [email, changedEmail]);
  });

  test('register, activate, log in/out, reset password, edit profile, change email, deactivate', { tag: ['@story', '@checklist'] }, async ({ page }, testInfo) => {
    test.setTimeout(10 * 60_000);
    const registration = new RegistrationPage(page);
    const loginPage = new LoginPage(page);
    const settings = new ProfileSettingsPage(page);

    const activation = await test.step('register as a student', async () => {
      await registration.goto();
      await registration.registerStudent({ username: 'QAStoryStudent', phone: '888123456', email, password: PASSWORD, grade: '7', city: 'София' });
      const activation = await expectEmail(email, Emails.activation);
      await registration.submit();
      logCreatedAccount(email, testInfo.project.name);

      await expect(page).toHaveURL(/\/registration\/success\/$/);
      await expect(registration.successHeading).toContainText('Трябва да потвърдиш регистрацията си!');
      return activation;
    });

    await test.step('activate it through the emailed link', async () => {
      // While Mandrill indexes the email: until it's activated, the account isn't logged in.
      await page.goto('/profile/');
      await expect(page).toHaveURL(/\/login\//);

      await page.goto(await activation.link());
      await expect(page.locator('#membership-content')).toHaveClass(/activation_success/);
      await expect(registration.confirmationCompleteHeading).toHaveText('Ти вече си част от Уча.се!');
    });

    await test.step('log in and log out', async () => {
      expect(await logIn(page, email, PASSWORD)).toBe(true);
      await registration.logout();
      await expect(registration.loginLink).toBeVisible();
      await expect(registration.userNavToggler).toHaveCount(0);
    });

    await test.step('reset the password through the emailed link', async () => {
      const resetPage = new ResetPasswordPage(page);
      await resetPage.goto();
      const reset = await expectEmail(email, Emails.passwordReset);
      await resetPage.requestReset(email);
      await expect(resetPage.requestSuccessMessage).toContainText(email);

      await page.goto(await reset.link());
      await resetPage.setNewPassword(RESET_PASSWORD);
      await expect(page).toHaveURL(/\/login\/$/);
      expect(await logIn(page, email, PASSWORD), 'the old password must stop working').toBe(false);
      expect(await logIn(page, email, RESET_PASSWORD)).toBe(true);
    });

    await test.step('edit name and gender (phone re-verification)', async () => {
      await settings.goto();
      await settings.openPersonalDataEdit();
      await settings.nameInput.fill('QA Edited Name');
      await settings.genderMaleLabel.click();
      await settings.savePersonalData();
      // Saving personal data always asks to re-verify the phone, even if it wasn't changed.
      await settings.confirmSentCode('111111');
      await expect(settings.personalDataEditButton).toBeVisible();
      await expect(settings.personalDataPreview).toContainText('QA Edited Name');
      await expect(settings.personalDataPreview).toContainText('Момче');
    });

    await test.step('change the grade (saves directly, no verification)', async () => {
      await settings.openSchoolClassEdit();
      await settings.schoolClassGradeSelect.selectOption({ label: '9. клас' });
      await settings.saveSchoolClass();
      await expect(settings.codeVerificationModal).toBeHidden();
      await expect(settings.schoolClassPreview).toContainText('9. клас');
    });

    await test.step('turn on comment-reply email notifications', async () => {
      // Off by default — the preview phrases it as "I don't want ...".
      await expect(settings.newsletterPreview).toContainText('Не искам да получавам имейл известия');
      await settings.openNewsletterEdit();
      await expect(settings.commentReplyToggleCheckbox).not.toBeChecked();
      await settings.commentReplyToggleLabel.click();
      await expect(settings.commentReplyToggleCheckbox).toBeChecked();
      await settings.saveNewsletter();
      await expect(settings.emailChangeCodeModal).toBeHidden();
      await expect(settings.newsletterEditButton).toBeVisible();
    });

    await test.step('change the password in settings', async () => {
      await settings.openLoginDetailsEdit();
      await settings.changePassword(RESET_PASSWORD, PASSWORD);
      await expect(settings.emailChangeCodeModal).toBeHidden();
      await settings.logout();
      expect(await logIn(page, email, RESET_PASSWORD), 'the old password must stop working').toBe(false);
      expect(await logIn(page, email, PASSWORD)).toBe(true);
    });

    await test.step('change the login email (SMS code, then a link to the new address)', async () => {
      await settings.goto();
      await settings.openLoginEmailEdit();
      const emailChange = await expectEmail(changedEmail, Emails.emailChange);
      await settings.submitNewLoginEmail(changedEmail, PASSWORD);
      // Still pending until the emailed link is visited — the preview keeps the old address.
      await expect(settings.loginEmailPreview).toContainText(email);
      await settings.confirmSendCodePrompt();
      await settings.confirmEmailChangeCode('111111');

      await page.goto(await emailChange.link());
      await expect(page.locator('body')).toContainText('успешно промени имейла');
      logCreatedAccount(changedEmail, testInfo.project.name);
      unlogAccount(email);
      expect(await logIn(page, email, PASSWORD), 'the old email must stop working').toBe(false);
      expect(await logIn(page, changedEmail, PASSWORD)).toBe(true);
    });

    await test.step('deactivate the account', async () => {
      await deactivateLoggedIn(page, PASSWORD);
      await expect(page).toHaveURL(/\/login\/$/);
      unlogAccount(changedEmail);
      await loginPage.login(changedEmail, PASSWORD).catch(() => {});
      await expect(loginPage.errorMessage).toBeVisible();
      await expect(page).toHaveURL(/\/login\/$/);
    });
  });
});
