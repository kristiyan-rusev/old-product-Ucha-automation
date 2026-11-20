import { expect, Page, TestInfo } from '@playwright/test';
import { testAddress } from '../test-data/credentials';
import { logIn, TEST_PASSWORDS, inFreshContext } from './accounts';
import { registerAccount, AccountKind } from './registerAndLogin';
import { SetDataPage } from '../pages/SetDataPage';

/**
 * Permanent test accounts: one per test (label `perm-<name>`), registered once and reused on every run —
 * nothing registers, activates or deletes an account per test. Never logged in created-accounts.log and never
 * in `accountsToRemove`, so no cleanup ever deactivates one.
 *
 * Only for tests that don't test registering / deleting. A test that changes nothing uses the shared student
 * (`users.student`) instead; the registration, account-deletion and Facebook tests keep registering.
 */

/**
 * Permanent accounts a test reset at the start and that must be reset again at its end (see utils/fixtures.ts),
 * with the page each one logged in on.
 */
export const permanentAccountsToReset: PermanentAccountToReset[] = [];
type PermanentAccountToReset = { email: string; password: string; page: Page };

/**
 * Logs in as the permanent account `perm-<name>` (registering + activating it through Mandrill only if the
 * login fails, i.e. the very first time). With `reset` (the default) the account is put back to its
 * just-registered state on /set-data.php first, and the check that the reset really worked has to pass; the
 * `test` from utils/fixtures.ts resets it again after the test, so nothing keeps running on dev — after a passing
 * test on this same `page`, still logged in. So `page` must stay logged in as this account until the test ends:
 * log anyone else in on another page.
 */
export async function permanentAccount(
  page: Page,
  testInfo: TestInfo,
  name: string,
  { kind = 'student', reset = true }: { kind?: AccountKind; reset?: boolean } = {}
) {
  const email = testAddress(`perm-${name}`);
  let password = await firstWorkingPassword(page, email);
  if (!password) {
    const activation = await registerAccount(page, email, kind);
    await page.goto(await activation.link());
    password = await firstWorkingPassword(page, email);
    if (!password) throw new Error(`Couldn't log in as the permanent account ${email} after registering it`);
  }
  if (reset) {
    await resetAccount(page);
    permanentAccountsToReset.push({ email, password, page });
  }
  return { email, password };
}

/**
 * Back to the just-registered state as far as payments go, and FIBank simulation off (a killed run can leave
 * "изтекла карта" on; the reset doesn't clear it). set-data's reset silently does nothing when dev's placeholder
 * payment user has no row — so the subscriptions table is checked afterwards. Normally two page loads: set-data
 * and the page its reset answers with (SetDataPage.resetToJustRegistered; until 2026-11-19 it was five).
 */
export async function resetAccount(page: Page) {
  const setData = new SetDataPage(page);
  const groups = await setData.resetToJustRegistered();
  const subscriptions = groups.filter((row) => row.length > 1 && !/^Общо/.test(row[0]));
  if (subscriptions.length > 0) {
    throw new Error(`set-data's reset left ${subscriptions.length} subscription(s) on the account: ${JSON.stringify(subscriptions)}`);
  }
  // Positive proof, not just "no rows": set-data prints this note in place of the table.
  await expect(setData.noSubscriptionNote, "set-data's reset didn't clear the account's subscriptions").toBeVisible();
}

/**
 * The end-of-test reset — never throws (a failed reset is only a warning). After a passing test (`sameWindow`) each
 * account is reset on the page it logged in on, if that page is still open: no new window, no new login (the
 * user's review, 2026-11-19). After a failing test, or when that page is closed or no longer logged in, in a fresh
 * browser context with a new login — a failed test's page may be anywhere, logged in as anyone.
 */
export async function resetPermanentAccounts(
  browser: Parameters<typeof inFreshContext>[0],
  baseURL: string,
  accounts: PermanentAccountToReset[],
  { sameWindow }: { sameWindow: boolean }
) {
  for (const { email, password, page: testPage } of accounts) {
    if (sameWindow && !testPage.isClosed()) {
      try {
        await resetAccount(testPage);
        continue;
      } catch (e) {
        console.warn(`[permanent accounts] couldn't reset ${email} in the test's window (${(e as Error).message.split('\n')[0]}) — resetting it with a new login`);
      }
    }
    await inFreshContext(browser, baseURL, async (page) => {
      if (!(await logIn(page, email, password))) throw new Error('login failed');
      await resetAccount(page);
    }).catch((e: Error) => console.warn(`[permanent accounts] couldn't reset ${email} at the end: ${e.message.split('\n')[0]}`));
  }
}

async function firstWorkingPassword(page: Page, email: string): Promise<string | null> {
  for (const password of TEST_PASSWORDS) {
    if (await logIn(page, email, password)) return password;
  }
  return null;
}
