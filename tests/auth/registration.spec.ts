import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';

// The registration form's first steps, walked as a guest without submitting, so no account is
// created. The last sub-step differs per user kind: the parent, teacher, Bulgarian-abroad and "other"
// ones are checked in their own stories, right before that account is registered (user-kinds.spec.ts).
test.describe('Registration', () => {
  test('a guest walks the form: user kind, then email or Facebook, then the registration form', async ({ page }) => {
    const registration = new RegistrationPage(page);

    await test.step('step 1 offers every user kind', async () => {
      await registration.goto();
      await expect(registration.studentOption).toBeVisible();
      await expect(registration.parentOption).toBeVisible();
      await expect(registration.teacherOption).toBeVisible();
      await expect(registration.bulgarianAbroadOption).toBeVisible();
      await expect(registration.otherOption).toBeVisible();
    });

    await test.step('choosing a kind offers email or Facebook signup, and a way back', async () => {
      await registration.selectUserKind('student');
      await expect(registration.registerWithEmailButton).toBeVisible();
      await expect(registration.registerWithFacebookButton).toBeVisible();
      await expect(registration.backToKindButton).toBeVisible();
    });

    await test.step('choosing email signup opens the form with username and phone fields', async () => {
      await registration.chooseEmailRegistration();
      await expect(registration.form).toBeVisible();
      await expect(registration.usernameInput).toBeVisible();
      await expect(registration.phoneNumberInput).toBeVisible();
    });
  });
});
