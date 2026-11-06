import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { testAddress } from '../../test-data/credentials';
import { logCreatedAccount, unlogAccount } from '../../utils/testAccountLog';
import { expectEmail, Emails } from '../../utils/mandrill';
import { deactivateLoggedIn, logIn, removeAccounts, TEST_PASSWORDS } from '../../utils/accounts';

// Parent, teacher, Bulgarian-abroad and "other" accounts, each as a short story on its own fixed
// address: register → activate through the emailed link → log in → deactivate. The student
// account has its own, longer story (student-account.spec.ts). The checks that don't submit the
// form (each kind's steps and fields) are in registration.spec.ts.
const PASSWORD = TEST_PASSWORDS[0];

const kinds: { name: string; label: string; register: (r: RegistrationPage, email: string) => Promise<void> }[] = [
  {
    name: 'parent',
    label: 'parent-story',
    register: (r, email) =>
      r.registerParent({ username: 'QAStoryParent', phone: '888123456', email, password: PASSWORD, profileType: 'student', grade: '7', city: 'София' }),
  },
  {
    name: 'teacher',
    label: 'teacher-story',
    register: (r, email) => r.registerTeacher({ username: 'QAStoryTeacher', phone: '888123456', email, password: PASSWORD, city: 'София' }),
  },
  {
    name: 'Bulgarian abroad',
    label: 'abroad-story',
    register: (r, email) =>
      r.registerBulgarianAbroad({ username: 'QAStoryAbroad', phone: '888123456', email, password: PASSWORD, city: 'Германия, Берлин' }),
  },
  {
    name: '"other"',
    label: 'other-story',
    register: (r, email) => r.registerOther({ username: 'QAStoryOther', phone: '888123456', email, password: PASSWORD }),
  },
];

for (const kind of kinds) {
  test.describe(`${kind.name} account — register, activate, log in, deactivate`, () => {
    const email = testAddress(kind.label);

    test.beforeEach(async ({ browser, baseURL }) => removeAccounts(browser, baseURL!, [email]));
    test.afterEach(async ({ browser, baseURL }) => removeAccounts(browser, baseURL!, [email]));

    test(`a ${kind.name} account can be registered, activated, used and deactivated`, { tag: '@story' }, async ({ page }, testInfo) => {
      test.setTimeout(4 * 60_000);
      const registration = new RegistrationPage(page);

      const activation = await test.step('register', async () => {
        await registration.goto();
        await kind.register(registration, email);
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
