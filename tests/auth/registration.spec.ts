import { test, expect } from '@playwright/test';

// The registration wizard's steps and fields for each user kind — checked without submitting,
// so no account is created. Registering for real (and activating, using and deactivating the
// account) is covered by the stories in student-account.spec.ts and user-kinds.spec.ts.
import { RegistrationPage } from '../../pages/RegistrationPage';
import { uniqueTestEmail } from '../../test-data/credentials';

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

});

test.describe('Registration — parent user kind', () => {
  let registrationPage: RegistrationPage;

  test.beforeEach(async ({ page }) => {
    registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
  });

  // The parent flow's final sub-step has an extra choice (school student vs. preschool
  // child) that the student flow never shows — it re-renders the same grade <select>'s
  // options (1.-12. клас vs. 1.-4. група) rather than being a separate field.
  test('choosing "preschool child" swaps the grade options to preschool groups', async () => {
    await registrationPage.selectUserKind('parent');
    await registrationPage.chooseEmailRegistration();
    await registrationPage.fillAccountDetails('QATestParent', '888123456');
    await registrationPage.fillCredentials(uniqueTestEmail('parentcheck'), 'TestPass123!');

    await expect(registrationPage.profileStudentRadio).toBeChecked();
    await expect(registrationPage.gradeSelect.locator('option').first()).toHaveText('Избери клас');
    await expect(registrationPage.gradeSelect.locator('option').nth(1)).toHaveText('1. клас');

    await registrationPage.selectProfileType('pre-school');

    await expect(registrationPage.profilePreSchoolRadio).toBeChecked();
    await expect(registrationPage.gradeSelect.locator('option').first()).toHaveText('Избери група');
    await expect(registrationPage.gradeSelect.locator('option')).toHaveCount(5); // placeholder + groups 1-4
  });

});

test.describe('Registration — teacher user kind', () => {
  let registrationPage: RegistrationPage;

  test.beforeEach(async ({ page }) => {
    registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
  });

  // The teacher flow's final sub-step has no grade selector at all (teachers aren't
  // assigned a grade/group) — it reuses the same two radio inputs as the parent flow, but
  // relabeled "Учител в училище" / "Учител в детска градина" with no effect on other fields.
  test('final step has a school/kindergarten teacher choice and no grade selector', async () => {
    await registrationPage.selectUserKind('teacher');
    await registrationPage.chooseEmailRegistration();
    await registrationPage.fillAccountDetails('QATestTeacher', '888123456');
    await registrationPage.fillCredentials(uniqueTestEmail('teachercheck'), 'TestPass123!');

    await expect(registrationPage.profileStudentLabel).toHaveText('Учител в училище');
    await expect(registrationPage.profilePreSchoolLabel).toHaveText('Учител в детска градина');
    await expect(registrationPage.profileStudentRadio).toBeChecked();
    await expect(registrationPage.gradeSelect).toHaveCount(0);
    await expect(registrationPage.citySelect).toBeVisible();
  });

});

test.describe('Registration — bulgarian-abroad user kind', () => {
  let registrationPage: RegistrationPage;

  test.beforeEach(async ({ page }) => {
    registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
  });

  // Same shape as teacher (no grade selector) but with a further difference: no
  // profile-type radio at all, and citySelect lists "Country, City" pairs abroad rather
  // than Bulgarian towns.
  test('final step lists foreign cities and has no grade selector or profile-type choice', async () => {
    await registrationPage.selectUserKind('bulgarian');
    await registrationPage.chooseEmailRegistration();
    await registrationPage.fillAccountDetails('QATestBulgarian', '888123456');
    await registrationPage.fillCredentials(uniqueTestEmail('bgcheck'), 'TestPass123!');

    await expect(registrationPage.gradeSelect).toHaveCount(0);
    await expect(registrationPage.profileStudentRadio).toHaveCount(0);
    await expect(registrationPage.citySelect).toBeVisible();
    await expect(registrationPage.citySelect.locator('option').filter({ hasText: 'Германия, Берлин' })).toHaveCount(1);
  });

});

test.describe('Registration — other user kind', () => {
  let registrationPage: RegistrationPage;

  test.beforeEach(async ({ page }) => {
    registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
  });

  // Unlike every other kind, "other" has no grade/city/school sub-step at all — those
  // selects don't exist in the DOM, "Напред" stays permanently hidden, and "Регистрирай се"
  // is already available right alongside email/password.
  test('credentials sub-step is the final one — no grade/city/school follow-up', async () => {
    await registrationPage.selectUserKind('other');
    await registrationPage.chooseEmailRegistration();
    await registrationPage.fillAccountDetails('QATestOther', '888123456');
    await registrationPage.fillFinalCredentials(uniqueTestEmail('othercheck'), 'TestPass123!');

    await expect(registrationPage.gradeSelect).toHaveCount(0);
    await expect(registrationPage.citySelect).toHaveCount(0);
    await expect(registrationPage.schoolSelect).toHaveCount(0);
    await expect(registrationPage.nextButton).toBeHidden();
    await expect(registrationPage.submitButton).toBeVisible();
  });

});
