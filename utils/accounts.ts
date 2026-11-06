import { Browser, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProfileSettingsPage } from '../pages/ProfileSettingsPage';
import { Emails, extractLink, findEmail } from './mandrill';
import { clickWhenReady } from './clickWhenReady';
import { unlogAccount } from './testAccountLog';

/**
 * Logging in, deactivating and cleaning up test accounts. Tests reuse fixed addresses
 * (testAddress() in test-data/credentials.ts), so every test removes its account at the end and
 * removes any leftover from an earlier, interrupted run before registering.
 */

/** Passwords test accounts can have (the stories change them along the way). */
export const TEST_PASSWORDS = ['TestPass123!', 'NewTestPass456!'];

/**
 * Logs in from /login/; true if it got past the login page (usually to "/", or to the page a
 * guest was sent away from). A failed login is not an error: a wrong password shows a message,
 * a never-activated account shows nothing at all. Waits up to 15 s — dev can be slow.
 */
export async function logIn(page: Page, email: string, password: string): Promise<boolean> {
  const loginPage = new LoginPage(page);
  await page.goto('/login/');
  await loginPage.emailInput.fill(email);
  await loginPage.passwordInput.fill(password);
  await clickWhenReady(loginPage.submitButton, () =>
    Promise.race([
      page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15_000 }),
      loginPage.errorMessage.waitFor({ state: 'visible', timeout: 15_000 }),
    ])
  ).catch(() => {});
  if (new URL(page.url()).pathname.startsWith('/login/device-verification')) await verifyNewDevice(page);
  return !new URL(page.url()).pathname.startsWith('/login');
}

/**
 * Accounts with a subscription keep only their last three devices; logging in from a new
 * browser (every test context is one) goes to /login/device-verification, which emails a
 * 6-digit code. On dev the bypass code 111111 is accepted, like for the SMS steps. When the
 * account already has three devices, the page then asks which one to replace ("Замени") —
 * fine for test accounts: the first one is replaced and confirmed.
 */
async function verifyNewDevice(page: Page) {
  const leftLogin = () => page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15_000 });
  const replaceButtons = page.locator('.single-device .edit-device-icon');
  await clickWhenReady(page.locator('#continue-verification'), () => page.locator('#code').waitFor({ state: 'visible', timeout: 10_000 }));
  await page.locator('#code').fill('111111');
  await clickWhenReady(page.locator('#code-verification-confirm-code-button'), () =>
    Promise.race([leftLogin(), replaceButtons.first().waitFor({ state: 'visible', timeout: 15_000 })])
  ).catch(() => {});
  if (await replaceButtons.first().isVisible()) {
    await clickWhenReady(replaceButtons.first(), () => page.locator('#confirm-exchange').waitFor({ state: 'visible', timeout: 10_000 }));
    await clickWhenReady(page.locator('#confirm-exchange'), leftLogin).catch(() => {});
  }
}

/** Thrown when the site doesn't allow deactivating: the account pays monthly for a subscription. */
export class DeactivationBlockedError extends Error {}

/** Deactivates the logged-in account through profile settings (SMS code 111111 on dev). */
export async function deactivateLoggedIn(page: Page, password: string) {
  const settings = new ProfileSettingsPage(page);
  await settings.goto();
  await page.waitForLoadState('load');
  if (await settings.deactivationBlockedNotice.isVisible()) {
    throw new DeactivationBlockedError(
      "Can't deactivate: the account has an active monthly-payment subscription (site rule) — only an admin can remove it"
    );
  }
  await settings.startDeactivation();
  await settings.verifyWithCode('111111');
  await settings.submitReason(1);
  await settings.confirmDeactivation(password);
}

export type CleanupOutcome = 'deactivated' | 'activated+deactivated' | 'not-found' | 'blocked-monthly-plan';

/**
 * Makes sure no active account uses `email`: logs in with the known passwords and deactivates
 * it. An account that can't log in may never have been activated — then its activation email
 * is looked up in Mandrill (up to 30 days back), the account activated and deactivated.
 */
export async function deactivateIfExists(page: Page, email: string, passwords = TEST_PASSWORDS): Promise<CleanupOutcome> {
  let password = await firstWorkingPassword(page, email, passwords);
  let activated = false;
  if (!password) {
    const activation = await findEmail(email, Emails.activation, new Date(Date.now() - 30 * 24 * 3600_000)).catch(() => null);
    if (!activation) return 'not-found';
    await page.goto(extractLink(activation, Emails.activation.link));
    password = await firstWorkingPassword(page, email, passwords);
    if (!password) return 'not-found';
    activated = true;
  }
  try {
    await deactivateLoggedIn(page, password);
  } catch (e) {
    if (e instanceof DeactivationBlockedError) return 'blocked-monthly-plan'; // stays in the log
    throw e;
  }
  unlogAccount(email);
  return activated ? 'activated+deactivated' : 'deactivated';
}

/** Runs `fn` in a new, clean browser context (no cookies from the test's own page). */
export async function inFreshContext<T>(browser: Browser, baseURL: string, fn: (page: Page) => Promise<T>): Promise<T> {
  const context = await browser.newContext({ baseURL });
  try {
    return await fn(await context.newPage());
  } finally {
    await context.close();
  }
}

/** deactivateIfExists for several addresses, each in its own clean context; never throws. */
export async function removeAccounts(browser: Browser, baseURL: string, emails: string[], passwords = TEST_PASSWORDS) {
  for (const email of emails) {
    await inFreshContext(browser, baseURL, (page) => deactivateIfExists(page, email, passwords))
      .then((outcome) => {
        if (outcome === 'blocked-monthly-plan') console.warn(`[accounts] ${email} pays monthly — the site won't let it be deactivated (stays in created-accounts.log)`);
      })
      .catch((e: Error) => console.warn(`[accounts] couldn't remove ${email} (stays in created-accounts.log): ${e.message.split('\n')[0]}`));
  }
}

async function firstWorkingPassword(page: Page, email: string, passwords: string[]): Promise<string | null> {
  for (const password of passwords) {
    if (await logIn(page, email, password)) return password;
  }
  return null;
}
