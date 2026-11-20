import { test, expect } from '@playwright/test';
import { RegistrationPage, UserKind } from '../../pages/RegistrationPage';
import { testAddress } from '../../test-data/credentials';
import { logCreatedAccount, unlogAccount } from '../../utils/testAccountLog';
import { expectEmail, Emails } from '../../utils/mandrill';
import { deactivateLoggedIn, logIn, removeAccounts, removeLeftovers, TEST_PASSWORDS } from '../../utils/accounts';

// Parent, teacher, Bulgarian-abroad and "other" accounts, each as a short story on its own fixed
// address: fill in the form → check its last sub-step, which is different for each kind →
// register → activate through the emailed link → log in → deactivate. The student account has its
// own, longer story (student-account.spec.ts); the form's first steps are walked as a guest in
// registration.spec.ts.
const PASSWORD = TEST_PASSWORDS[0];
const PHONE = '888123456';

const kinds: {
  name: string;
  label: string;
  kind: UserKind;
  username: string;
  /** What this kind's last sub-step shows: the title of the step that checks it. */
  finalStep: string;
  checkFinalStep: (r: RegistrationPage) => Promise<void>;
  /** Fills in the last sub-step, up to (not including) submit. */
  fillFinalStep: (r: RegistrationPage) => Promise<void>;
}[] = [
  {
    name: 'parent',
    label: 'parent-story',
    kind: 'parent',
    username: 'QAStoryParent',
    // The parent of a school student or of a preschool child: the choice re-renders the same grade
    // <select> (1.-12. клас vs. 1.-4. група) rather than showing another field.
    finalStep: 'choosing "preschool child" swaps the grades for preschool groups',
    checkFinalStep: async (r) => {
      await expect(r.profileStudentRadio).toBeChecked();
      await expect(r.gradeOptions.first()).toHaveText('Избери клас'); // the placeholder
      await expect(r.gradeOptions.nth(1)).toHaveText('1. клас'); // the first grade

      await r.selectProfileType('pre-school');
      await expect(r.profilePreSchoolRadio).toBeChecked();
      await expect(r.gradeOptions.first()).toHaveText('Избери група'); // the placeholder
      await expect(r.gradeOptions).toHaveCount(5); // placeholder + groups 1-4

      // Back to a school student, the profile this account is registered with (waits for the grades to return).
      await r.selectProfileType('student');
    },
    fillFinalStep: (r) => r.selectGradeCityAndSchool('7', 'София'),
  },
  {
    name: 'teacher',
    label: 'teacher-story',
    kind: 'teacher',
    username: 'QAStoryTeacher',
    // Teachers get no grade: the parent's two radios are relabelled and change nothing else.
    finalStep: 'a school/kindergarten teacher choice and no grade selector',
    checkFinalStep: async (r) => {
      await expect(r.profileStudentLabel).toHaveText('Учител в училище');
      await expect(r.profilePreSchoolLabel).toHaveText('Учител в детска градина');
      await expect(r.profileStudentRadio).toBeChecked();
      await expect(r.gradeSelect).toHaveCount(0);
      await expect(r.citySelect).toBeVisible();
    },
    fillFinalStep: (r) => r.selectCityAndSchool('София'),
  },
  {
    name: 'Bulgarian abroad',
    label: 'abroad-story',
    kind: 'bulgarian',
    username: 'QAStoryAbroad',
    // Like the teacher's without the profile-type choice, and the cities are "Country, City" abroad.
    finalStep: 'foreign cities, no grade selector or profile-type choice',
    checkFinalStep: async (r) => {
      await expect(r.gradeSelect).toHaveCount(0);
      await expect(r.profileStudentRadio).toHaveCount(0);
      await expect(r.citySelect).toBeVisible();
      await expect(r.cityOption('Германия, Берлин')).toHaveCount(1);
    },
    fillFinalStep: (r) => r.selectCityAndSchool('Германия, Берлин'),
  },
  {
    name: '"other"',
    label: 'other-story',
    kind: 'other',
    username: 'QAStoryOther',
    // No grade, city or school at all: "Напред" stays hidden and "Регистрирай се" is already there.
    finalStep: 'the credentials sub-step is the last one, no grade/city/school follow-up',
    checkFinalStep: async (r) => {
      await expect(r.gradeSelect).toHaveCount(0);
      await expect(r.citySelect).toHaveCount(0);
      await expect(r.schoolSelect).toHaveCount(0);
      await expect(r.nextButton).toBeHidden();
      await expect(r.submitButton).toBeVisible();
    },
    fillFinalStep: async () => {}, // the credentials were filled on the way
  },
];

for (const kind of kinds) {
  test.describe(`${kind.name} account — register, activate, log in, deactivate`, () => {
    const email = testAddress(kind.label);

    test.beforeEach(async ({ browser, baseURL }) => removeLeftovers(browser, baseURL!, [email]));
    // A passing story deactivated its account itself; after a failure, remove it the thorough way.
    test.afterEach(async ({ browser, baseURL }, testInfo) => {
      if (testInfo.status !== 'passed') await removeAccounts(browser, baseURL!, [email]);
    });

    test(`a ${kind.name} account can be registered, activated, used and deactivated`, { tag: ['@story', '@checklist'] }, async ({ page }, testInfo) => {
      test.setTimeout(4 * 60_000);
      const registration = new RegistrationPage(page);

      await test.step('fill in the form up to its last sub-step', async () => {
        await registration.goto();
        await registration.fillUpToFinalStep(kind.kind, { username: kind.username, phone: PHONE, email, password: PASSWORD });
      });

      await test.step(`last sub-step: ${kind.finalStep}`, () => kind.checkFinalStep(registration));

      const activation = await test.step('register', async () => {
        await kind.fillFinalStep(registration);
        const activation = await expectEmail(email, Emails.activation);
        await registration.submit();
        logCreatedAccount(email, testInfo.project.name);
        await expect(page).toHaveURL(/\/registration\/success\/$/);
        await expect(registration.successHeading).toContainText('Трябва да потвърдиш регистрацията си!');
        return activation;
      });

      await test.step('activate through the emailed link', async () => {
        await page.goto(await activation.link());
        await expect(registration.confirmationCompleteHeading).toHaveText('Ти вече си част от Уча.се!');
      });

      await test.step('log in', async () => {
        expect(await logIn(page, email, PASSWORD)).toBe(true);
      });

      await test.step('deactivate', async () => {
        await deactivateLoggedIn(page, PASSWORD);
        await expect(page).toHaveURL(/\/login\/$/);
        unlogAccount(email);
        expect(await logIn(page, email, PASSWORD), 'a deactivated account must not log in').toBe(false);
      });
    });
  });
}
