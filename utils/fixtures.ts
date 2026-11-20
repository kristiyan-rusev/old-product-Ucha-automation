import { test as base, expect } from '@playwright/test';
import { accountsToRemove } from './registerAndLogin';
import { removeAccounts } from './accounts';
import { permanentAccountsToReset, resetPermanentAccounts } from './permanentAccount';

/**
 * `test` with automatic account cleanup: every account a test registers through
 * registerAndLogin() is deactivated when the test ends — passed or failed — so test runs
 * leave no accounts behind on dev. Use this `test` in specs that call registerAndLogin().
 */
export const test = base.extend<{ removeTestAccounts: void; resetPermanentAccountsAtEnd: void }>({
  // Accounts from permanentAccount() are reset on /set-data.php again after the test, so no contract, auto-renewal
  // or failing-card simulation keeps running on dev and the next login needs no new-device step. After a passing test
  // in the window it ended in, still logged in; after a failing one with a new login (resetPermanentAccounts).
  // Depends on `context` only for the order: Playwright closes the test's window when it tears `context` down, and a
  // fixture that uses `context` is torn down before it — so the window is still open here.
  resetPermanentAccountsAtEnd: [
    async ({ browser, baseURL, context }, use, testInfo) => {
      permanentAccountsToReset.length = 0;
      await use();
      await resetPermanentAccounts(browser, baseURL!, permanentAccountsToReset.splice(0), {
        sameWindow: testInfo.status === testInfo.expectedStatus,
      });
    },
    { auto: true, timeout: 180_000 },
  ],
  removeTestAccounts: [
    async ({ browser, baseURL }, use) => {
      accountsToRemove.length = 0;
      await use();
      await removeAccounts(browser, baseURL!, accountsToRemove.splice(0));
    },
    { auto: true, timeout: 180_000 }, // own timeout: deactivating takes ~30 s per account
  ],
});

export { expect };
