import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { LoginPage } from '../../pages/LoginPage';
import { ProfileSettingsPage } from '../../pages/ProfileSettingsPage';
import { uniqueTestEmail } from '../../test-data/credentials';
import { logCreatedAccount } from '../../utils/testAccountLog';
import { fetchRegistrationConfirmationLink, fetchEmailChangeConfirmationLink } from '../../utils/fetchConfirmationLink';

test.describe('Profile settings — personal data', () => {
  // Uses a dedicated throwaway account, same reasoning as account-deactivation — this
  // mutates real profile data, so it must never touch the shared student/parent/teacher
  // fixture accounts other tests depend on.
  test('editing name and gender updates the profile after phone re-verification', async ({ page }, testInfo) => {
    test.setTimeout(90_000);

    const email = uniqueTestEmail('profiledata');
    const password = 'TestPass123!';

    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
    await registrationPage.registerStudent({
      username: 'QAProfileData',
      phone: '888123456',
      email,
      password,
      grade: '7',
      city: 'София',
    });
    await registrationPage.submit();
    logCreatedAccount(email, testInfo.project.name);

    const confirmationLink = await fetchRegistrationConfirmationLink(email);
    await page.goto(confirmationLink);

    const loginPage = new LoginPage(page);
    await page.goto('/login/');
    await loginPage.login(email, password);
    await expect(page).toHaveURL('/');

    const settingsPage = new ProfileSettingsPage(page);
    await settingsPage.goto();

    await settingsPage.openPersonalDataEdit();
    await settingsPage.nameInput.fill('QA Edited Name');
    await settingsPage.genderMaleLabel.click();
    await settingsPage.savePersonalData();

    // Saving personal data always triggers phone re-verification, even though phone
    // itself wasn't touched — the dev-environment SMS bypass code (111111) applies here too.
    await settingsPage.confirmSentCode('111111');

    await expect(settingsPage.personalDataEditButton).toBeVisible();
    await expect(settingsPage.personalDataPreview).toContainText('QA Edited Name');
    await expect(settingsPage.personalDataPreview).toContainText('Момче');
  });
});

test.describe('Profile settings — school & grade', () => {
  // Same dedicated-throwaway-account reasoning as the personal data tests above.
  test('editing grade updates the profile directly, with no phone re-verification', async ({ page }, testInfo) => {
    test.setTimeout(90_000);

    const email = uniqueTestEmail('schoolclass');
    const password = 'TestPass123!';

    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
    await registrationPage.registerStudent({
      username: 'QASchoolClass',
      phone: '888123456',
      email,
      password,
      grade: '7',
      city: 'София',
    });
    await registrationPage.submit();
    logCreatedAccount(email, testInfo.project.name);

    const confirmationLink = await fetchRegistrationConfirmationLink(email);
    await page.goto(confirmationLink);

    const loginPage = new LoginPage(page);
    await page.goto('/login/');
    await loginPage.login(email, password);
    await expect(page).toHaveURL('/');

    const settingsPage = new ProfileSettingsPage(page);
    await settingsPage.goto();

    await settingsPage.openSchoolClassEdit();
    await settingsPage.schoolClassGradeSelect.selectOption({ label: '9. клас' });
    await settingsPage.saveSchoolClass();

    // Unlike personal data, this section saves directly — no code-verification modal.
    await expect(settingsPage.codeVerificationModal).toBeHidden();
    await expect(settingsPage.schoolClassEditButton).toBeVisible();
    await expect(settingsPage.schoolClassPreview).toContainText('9. клас');
  });
});

test.describe('Profile settings — login email', () => {
  // Same dedicated-throwaway-account reasoning as the other profile-settings tests above —
  // this one especially, since it changes the account's login identity entirely.
  test('changing login email requires SMS confirmation, then a confirmation link emailed to the new address', async ({
    page,
  }, testInfo) => {
    test.setTimeout(120_000);

    const email = uniqueTestEmail('loginemail');
    const newEmail = uniqueTestEmail('loginemail2');
    const password = 'TestPass123!';

    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
    await registrationPage.registerStudent({
      username: 'QALoginEmail',
      phone: '888123456',
      email,
      password,
      grade: '7',
      city: 'София',
    });
    await registrationPage.submit();
    logCreatedAccount(email, testInfo.project.name);

    const confirmationLink = await fetchRegistrationConfirmationLink(email);
    await page.goto(confirmationLink);

    const loginPage = new LoginPage(page);
    await page.goto('/login/');
    await loginPage.login(email, password);
    await expect(page).toHaveURL('/');

    const settingsPage = new ProfileSettingsPage(page);
    await settingsPage.goto();

    await settingsPage.openLoginEmailEdit();
    await settingsPage.submitNewLoginEmail(newEmail, password);
    // The email doesn't switch immediately — it's still pending until the link below is
    // visited, so the preview should keep showing the old address at this point.
    await expect(settingsPage.loginEmailPreview).toContainText(email);

    await settingsPage.confirmSendCodePrompt();
    await settingsPage.confirmEmailChangeCode('111111');

    // Visiting the emailed link finalizes the change and logs the user out.
    const emailChangeLink = await fetchEmailChangeConfirmationLink(newEmail);
    await page.goto(emailChangeLink);
    await expect(page.locator('body')).toContainText('успешно промени имейла');

    // Old email should no longer work; the new one should.
    await page.goto('/login/');
    await loginPage.login(email, password);
    await expect(loginPage.errorMessage).toBeVisible();

    await page.goto('/login/');
    await loginPage.login(newEmail, password);
    await expect(page).toHaveURL('/');
  });
});

test.describe('Profile settings — password', () => {
  // Same dedicated-throwaway-account reasoning as the other profile-settings tests above.
  test('changing password saves directly and takes effect on next login', async ({ page }, testInfo) => {
    test.setTimeout(90_000);

    const email = uniqueTestEmail('pwdchange');
    const password = 'TestPass123!';
    const newPassword = 'NewTestPass456!';

    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
    await registrationPage.registerStudent({
      username: 'QAPwdChange',
      phone: '888123456',
      email,
      password,
      grade: '7',
      city: 'София',
    });
    await registrationPage.submit();
    logCreatedAccount(email, testInfo.project.name);

    const confirmationLink = await fetchRegistrationConfirmationLink(email);
    await page.goto(confirmationLink);

    const loginPage = new LoginPage(page);
    await page.goto('/login/');
    await loginPage.login(email, password);
    await expect(page).toHaveURL('/');

    const settingsPage = new ProfileSettingsPage(page);
    await settingsPage.goto();

    await settingsPage.openLoginDetailsEdit();
    await settingsPage.changePassword(password, newPassword);

    // Unlike login email, this section saves directly — no code-verification modal.
    await expect(settingsPage.emailChangeCodeModal).toBeHidden();
    await expect(settingsPage.loginDetailsEditButton).toBeVisible();

    await settingsPage.logout();

    await page.goto('/login/');
    await loginPage.login(email, password);
    await expect(loginPage.errorMessage).toBeVisible();

    await page.goto('/login/');
    await loginPage.login(email, newPassword);
    await expect(page).toHaveURL('/');
  });
});

test.describe('Profile settings — notification preferences', () => {
  // Same dedicated-throwaway-account reasoning as the other profile-settings tests above.
  test('turning on comment-reply email notifications updates the preview text and icon', async ({
    page,
  }, testInfo) => {
    test.setTimeout(90_000);

    const email = uniqueTestEmail('newsletter');
    const password = 'TestPass123!';

    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
    await registrationPage.registerStudent({
      username: 'QANewsletter',
      phone: '888123456',
      email,
      password,
      grade: '7',
      city: 'София',
    });
    await registrationPage.submit();
    logCreatedAccount(email, testInfo.project.name);

    const confirmationLink = await fetchRegistrationConfirmationLink(email);
    await page.goto(confirmationLink);

    const loginPage = new LoginPage(page);
    await page.goto('/login/');
    await loginPage.login(email, password);
    await expect(page).toHaveURL('/');

    const settingsPage = new ProfileSettingsPage(page);
    await settingsPage.goto();

    // Both toggles are off by default — preview phrases it as "I don't want ...".
    await expect(settingsPage.newsletterPreview).toContainText('Не искам да получавам имейл известия');

    await settingsPage.openNewsletterEdit();
    await expect(settingsPage.commentReplyToggleCheckbox).not.toBeChecked();
    await settingsPage.commentReplyToggleLabel.click();
    await expect(settingsPage.commentReplyToggleCheckbox).toBeChecked();
    await settingsPage.saveNewsletter();

    // Unlike email/personal data, this section saves directly — no code-verification modal.
    await expect(settingsPage.emailChangeCodeModal).toBeHidden();
    await expect(settingsPage.newsletterEditButton).toBeVisible();
    // The preview text itself flips polarity ("I don't want" -> "I want"), not just the icon.
    await expect(settingsPage.newsletterPreview).toContainText('Искам да получавам имейл известия');
    await expect(settingsPage.newsletterPreview.locator('.status-icon.status-on')).toHaveCount(1);
  });
});
