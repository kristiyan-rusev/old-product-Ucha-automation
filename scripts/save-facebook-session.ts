import 'dotenv/config';
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Logs in to Facebook once, in a visible browser, and saves that session for the Facebook tests
 * (Staging Checklist rows 3 and 12):
 *
 *   npx tsx scripts/save-facebook-session.ts
 *
 * Facebook watches automated logins, so the tests never type the Facebook password: they reuse
 * this saved session and the same browser identity (user agent), so Facebook sees one known
 * device. If Facebook asks to confirm the login (a code sent to the account's email), type it into
 * the browser window yourself — the script waits up to 10 minutes. Run it again when the tests say
 * the Facebook session has expired.
 *
 * Login from .env: UCHA_FB_EMAIL / UCHA_FB_PASSWORD. The session is saved to
 * playwright/.auth/facebook.json (+ facebook-ua.json), which git ignores.
 */

const AUTH_DIR = path.join(__dirname, '..', 'playwright', '.auth');
export const FACEBOOK_STATE = path.join(AUTH_DIR, 'facebook.json');
export const FACEBOOK_UA = path.join(AUTH_DIR, 'facebook-ua.json');

async function main() {
  const email = process.env.UCHA_FB_EMAIL;
  const password = process.env.UCHA_FB_PASSWORD;
  if (!email || !password) throw new Error('UCHA_FB_EMAIL / UCHA_FB_PASSWORD are missing from .env');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ locale: 'en-US' });
  const page = await context.newPage();
  await page.goto('https://www.facebook.com/login/');

  // EU cookie dialog (role=button divs) — it may not appear at all.
  const cookieButton = page.getByRole('button', { name: 'Decline optional cookies' });
  await cookieButton
    .waitFor({ state: 'visible', timeout: 8000 })
    .then(() => cookieButton.click())
    .catch(() => {});

  // Facebook's ids are generated (_r_2_…); the field names are stable.
  await page.locator('input[name="email"]').fill(email);
  const passwordInput = page.locator('input[name="pass"]');
  await passwordInput.fill(password);
  await passwordInput.press('Enter'); // the "Log In" control is a div with role=button

  console.log('Logging in to Facebook… if it asks for a code or a confirmation, do it in the browser window.');
  const deadline = Date.now() + 10 * 60_000;
  for (;;) {
    const loggedIn = (await context.cookies('https://www.facebook.com')).some((c) => c.name === 'c_user');
    const url = page.url();
    if (loggedIn && !/\/(login|checkpoint|two_step_verification)/.test(url)) break;
    if (Date.now() > deadline) throw new Error(`Not logged in to Facebook after 10 minutes (last page: ${url})`);
    await page.waitForTimeout(2000);
  }

  fs.mkdirSync(AUTH_DIR, { recursive: true });
  await context.storageState({ path: FACEBOOK_STATE });
  fs.writeFileSync(FACEBOOK_UA, JSON.stringify({ userAgent: await page.evaluate(() => navigator.userAgent) }, null, 2));
  console.log(`Saved the Facebook session to ${path.relative(process.cwd(), FACEBOOK_STATE)}`);
  await browser.close();
}

main().catch((e) => {
  console.error('FAILED', e.message);
  process.exit(1);
});
