import { Browser, BrowserContext, Page } from '@playwright/test';
import { AdminAccessPage } from '../pages/AdminAccessPage';
import { LoginPage } from '../pages/LoginPage';

/**
 * The QA admin (`UCHA_ADMIN_*` from .env) in a browser context of its own, past 2FA, on `path`. Dev
 * sometimes doesn't answer an admin page for minutes: PHP keeps a session locked while an earlier
 * request of it is still running, and requests never time out on the server — so a stuck page is
 * retried in a brand-new session, never reloaded in the same one. The caller closes the context.
 */
export async function openAdminPage(browser: Browser, baseURL: string, path: string, tries = 3): Promise<{ context: BrowserContext; page: Page }> {
  for (let attempt = 1; ; attempt++) {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    const admin = new AdminAccessPage(page);
    try {
      // The page object's own waits are short for a slow dev; where the browser ends up is what counts.
      await admin.logIn(process.env.UCHA_ADMIN_EMAIL!, process.env.UCHA_ADMIN_PASSWORD!).catch(() => {});
      if (await new LoginPage(page).errorMessage.isVisible()) {
        await context.close();
        throw new Error('The QA admin login was refused — check UCHA_ADMIN_EMAIL / UCHA_ADMIN_PASSWORD in .env');
      }
      await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 60_000, waitUntil: 'commit' });
      await admin.gotoAccessVerification();
      await admin.confirmWithCode('111111').catch(() => {});
      // Fully loaded before moving on, so it doesn't hold the session for the next page.
      await page.waitForURL(/\/admin\/adminPanel\.php/, { timeout: 60_000 });
      await page.goto(path, { timeout: 60_000 });
      return { context, page };
    } catch (e) {
      if ((e as Error).message.startsWith('The QA admin login was refused')) throw e;
      await context.close();
      if (attempt >= tries) throw e;
    }
  }
}
