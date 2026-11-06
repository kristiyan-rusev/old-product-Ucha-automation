import { test as base, expect } from '@playwright/test';
import { accountsToRemove } from './registerAndLogin';
import { removeAccounts } from './accounts';

/**
 * `test` with automatic account cleanup: every account a test registers through
 * registerAndLogin() is deactivated when the test ends — passed or failed — so test runs
 * leave no accounts behind on dev. Use this `test` in specs that call registerAndLogin().
 */
export const test = base.extend<{ removeTestAccounts: void }>({
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
