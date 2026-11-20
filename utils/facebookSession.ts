import * as fs from 'fs';
import * as path from 'path';

/**
 * The saved Facebook session of the Facebook test account — made once by
 * `npx tsx scripts/save-facebook-session.ts` (visible browser, the password is typed there, never
 * in a test). The tests reuse it, together with the browser identity (user agent) it was made with,
 * so Facebook sees one known device. Both files are gitignored.
 */
const AUTH_DIR = path.join(__dirname, '..', 'playwright', '.auth');
const STATE = path.join(AUTH_DIR, 'facebook.json');
const UA = path.join(AUTH_DIR, 'facebook-ua.json');

export const FACEBOOK_SESSION_HELP = 'run npx tsx scripts/save-facebook-session.ts';

/** For `test.use(...)`: the saved session, or nothing when it is missing (see requireFacebookSession). */
export function facebookSessionOptions(): { storageState?: string; userAgent?: string } {
  if (!fs.existsSync(STATE) || !fs.existsSync(UA)) return {};
  return { storageState: STATE, userAgent: JSON.parse(fs.readFileSync(UA, 'utf8')).userAgent };
}

/** Fails the test with the one-line fix when the saved Facebook session is missing. */
export function requireFacebookSession() {
  if (!fs.existsSync(STATE) || !fs.existsSync(UA)) {
    throw new Error(`The saved Facebook session is missing: ${FACEBOOK_SESSION_HELP}`);
  }
}
