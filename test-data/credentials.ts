/**
 * Every test address is a "+" alias of one real Gmail inbox, kautotester@gmail.com. Emails to
 * it are read from Mandrill (utils/mandrill.ts), so the inbox itself is never opened — it only
 * has to exist, so emails don't bounce.
 */
const INBOX_USER = 'kautotester';
const INBOX_DOMAIN = 'gmail.com';

/**
 * A fixed test address: kautotester+<label>@gmail.com. Tests reuse the same addresses on every
 * run — the account is deactivated at the end of the test and registered again next time (the
 * site allows re-registering a deactivated account's email), so dev doesn't fill up with
 * accounts.
 */
export function testAddress(label: string): string {
  return `${INBOX_USER}+${label}@${INBOX_DOMAIN}`;
}

/**
 * A never-used address, for forms that are filled in but never submitted (no account is
 * created). Keep `label` to 15 characters or fewer: the email input has `maxlength="50"`, and
 * `kautotester+` (12) + label + a 13-digit timestamp + `@gmail.com` (10) must fit. A longer
 * label gets silently cut mid-domain — the form then rejects the address and the wizard
 * doesn't advance, which looks like a timing or selector failure on the next field.
 */
export function uniqueTestEmail(label: string): string {
  return `${INBOX_USER}+${label}${Date.now()}@${INBOX_DOMAIN}`;
}

/** Shared accounts — for looking around and logging in only; never change their state. */
export const users = {
  student: { email: testAddress('student'), password: 'Testparola*' },
  parent: { email: testAddress('parent'), password: 'Testparola*' },
  teacher: { email: testAddress('teacher'), password: 'Testparola*' },
};
