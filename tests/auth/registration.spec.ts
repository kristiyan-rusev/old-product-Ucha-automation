import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { uniqueTestEmail } from '../../test-data/credentials';
import { logCreatedAccount } from '../../utils/testAccountLog';

test.describe('Registration', () => {
  let registrationPage: RegistrationPage;

  test.beforeEach(async ({ page }) => {
    registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
  });

  test('step 1 — all user kind options are visible', async () => {
    await expect(registrationPage.studentOption).toBeVisible();
    await expect(registrationPage.parentOption).toBeVisible();
    await expect(registrationPage.teacherOption).toBeVisible();
    await expect(registrationPage.bulgarianAbroadOption).toBeVisible();
    await expect(registrationPage.otherOption).toBeVisible();
  });

  test('selecting a user kind reveals the email/Facebook signup choice', async () => {
    await registrationPage.selectUserKind('student');
    await expect(registrationPage.registerWithEmailButton).toBeVisible();
    await expect(registrationPage.registerWithFacebookButton).toBeVisible();
    await expect(registrationPage.backToKindButton).toBeVisible();
  });

  test('choosing email signup reveals the registration form with username and phone fields', async () => {
    await registrationPage.selectUserKind('student');
    await registrationPage.chooseEmailRegistration();
    await expect(registrationPage.form).toBeVisible();
    await expect(registrationPage.usernameInput).toBeVisible();
    await expect(registrationPage.phoneNumberInput).toBeVisible();
  });

  // Note: this creates a real user account on the dev environment each run, using a
  // disposable email under the kristest2233+ alias already used for other test accounts.
  test('completing all steps with valid data creates the account', async ({ page }, testInfo) => {
    const email = uniqueTestEmail('reg');
    await registrationPage.registerStudent({
      username: 'QATestStudent',
      phone: '888123456',
      email,
      password: 'TestPass123!',
      grade: '7',
      city: 'София',
    });

    await registrationPage.submit();
    // The account is created server-side by the click above, regardless of what the
    // assertions below find — log it now so it's recorded even if they fail.
    logCreatedAccount(email, testInfo.project.name);

    await expect(page).toHaveURL(/\/registration\/success\/$/);
    await expect(registrationPage.successHeading).toBeVisible();
    await expect(registrationPage.successHeading).toContainText('Трябва да потвърдиш регистрацията си!');
  });
});
