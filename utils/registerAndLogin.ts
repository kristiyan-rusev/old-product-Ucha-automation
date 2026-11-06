import { Page, TestInfo } from '@playwright/test';
import { RegistrationPage } from '../pages/RegistrationPage';
import { testAddress, uniqueTestEmail } from '../test-data/credentials';
import { logCreatedAccount } from './testAccountLog';
import { expectEmail, Emails } from './mandrill';
import { logIn, removeAccounts } from './accounts';

/** Accounts registered by the running test — utils/fixtures.ts deactivates them afterwards. */
export const accountsToRemove: string[] = [];

/**
 * Registers a student on the fixed address kautotester+<label>@gmail.com, activates it through
 * the emailed link (read from Mandrill) and logs in. For tests that change account state —
 * purchases especially — so each gets its own account. Any leftover account on that address
 * from an interrupted run is deactivated first; the test's own account is deactivated after
 * the test by utils/fixtures.ts (import `test` from there in specs that use this).
 *
 * `{ monthlyPlan: true }` for tests that buy a monthly-payment plan: the site doesn't let such
 * an account be deactivated, so it can't free its address for the next run — it gets a new
 * address each run instead, and stays in created-accounts.log for an admin to remove (see
 * automation/ATTENTION.md).
 */
export async function registerAndLogin(page: Page, testInfo: TestInfo, label: string, { monthlyPlan = false } = {}) {
  const email = monthlyPlan ? uniqueTestEmail(label) : testAddress(label);
  const password = 'TestPass123!';
  const baseURL = testInfo.project.use.baseURL!;
  if (!monthlyPlan) await removeAccounts(page.context().browser()!, baseURL, [email]);

  const registrationPage = new RegistrationPage(page);
  await registrationPage.goto();
  await registrationPage.registerStudent({ username: 'QASubscription', phone: '888123456', email, password, grade: '7', city: 'София' });
  const activation = await expectEmail(email, Emails.activation);
  await registrationPage.submit();
  logCreatedAccount(email, testInfo.project.name);
  if (!monthlyPlan) accountsToRemove.push(email);

  await page.goto(await activation.link());
  if (!(await logIn(page, email, password))) throw new Error(`Couldn't log in as ${email} after activating it`);
  return { email, password };
}
