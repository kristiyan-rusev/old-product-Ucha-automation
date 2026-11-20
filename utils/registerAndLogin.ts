import { Page, TestInfo } from '@playwright/test';
import { RegistrationPage } from '../pages/RegistrationPage';
import { testAddress } from '../test-data/credentials';
import { logCreatedAccount } from './testAccountLog';
import { expectEmail, Emails } from './mandrill';
import { logIn, removeAccounts, removeLeftovers } from './accounts';

/** Accounts registered by the running test — utils/fixtures.ts deactivates them afterwards. */
export const accountsToRemove: string[] = [];

export const TEST_ACCOUNT_PASSWORD = 'TestPass123!';
export type AccountKind = 'student' | 'preschool-parent';

/**
 * Fills the registration form for `kind` and submits it; returns the pending activation email
 * (announced to Mandrill before the submit). Shared by registerAndLogin and permanentAccount.
 */
export async function registerAccount(page: Page, email: string, kind: AccountKind = 'student') {
  const registrationPage = new RegistrationPage(page);
  const password = TEST_ACCOUNT_PASSWORD;
  await registrationPage.goto();
  if (kind === 'preschool-parent') {
    // A parent of a pre-school child — the kind that can use a kindergarten (АДГ) code; grade "2" = 2. група.
    await registrationPage.registerParent({ username: 'QAKindergarten', phone: '888123456', email, password, profileType: 'pre-school', grade: '2', city: 'София' });
  } else {
    await registrationPage.registerStudent({ username: 'QASubscription', phone: '888123456', email, password, grade: '7', city: 'София' });
  }
  const activation = await expectEmail(email, Emails.activation);
  await registrationPage.submit();
  return activation;
}

/**
 * Registers a student (or, with kind 'preschool-parent', a parent of a pre-school child) on the fixed address kautotester+<label>@gmail.com, activates it through
 * the emailed link (read from Mandrill) and logs in. Only for tests about registering / deleting an
 * account — everything else uses a permanent account (utils/permanentAccount.ts). Any leftover account on that address
 * from an interrupted run is deactivated first; the test's own account is deactivated after
 * the test by utils/fixtures.ts (import `test` from there in specs that use this) — an account
 * on a monthly-payment plan too: its subscription data is reset on /set-data.php first, since
 * the site doesn't let an account that pays monthly be deactivated.
 */
export async function registerAndLogin(page: Page, testInfo: TestInfo, label: string, kind: AccountKind = 'student') {
  const email = testAddress(label);
  const password = TEST_ACCOUNT_PASSWORD;
  const baseURL = testInfo.project.use.baseURL!;
  const browser = page.context().browser()!;
  await removeLeftovers(browser, baseURL, [email]);

  const register = () => registerAccount(page, email, kind);
  let activation;
  try {
    activation = await register();
  } catch {
    // Refused although the log knows no account here (e.g. the log was cleared): remove whatever is
    // on the address, the thorough way, and register once more.
    await removeAccounts(browser, baseURL, [email]);
    activation = await register();
  }
  logCreatedAccount(email, testInfo.project.name);
  accountsToRemove.push(email);

  await page.goto(await activation.link());
  if (!(await logIn(page, email, password))) throw new Error(`Couldn't log in as ${email} after activating it`);
  return { email, password };
}
