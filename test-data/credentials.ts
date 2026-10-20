/**
 * A fresh, never-before-used email for registration tests — each run needs a unique one.
 *
 * Keep `label` to 14 characters or fewer: the registration form's email input has
 * `maxlength="50"`, and `kristest2233+` (13) + label + a 13-digit timestamp + `@gmail.com`
 * (10) must fit within that. A longer label gets silently truncated mid-domain (e.g. cut
 * to "...@gmail." with "com" missing) — the form then rejects it as an invalid email and
 * registration never advances, which looks exactly like a stale-selector/timing failure on
 * whatever field comes next, not what's actually wrong (found the hard way).
 */
export function uniqueTestEmail(label: string): string {
  return `kristest2233+${label}${Date.now()}@gmail.com`;
}

export const users = {
  student: {
    email: "kristest2233+student@gmail.com",
    password: "Testparola*",
  },
  parent: {
    email: "kristest2233+parent@gmail.com",
    password: "Testparola*",
  },
  teacher: {
    email: "kristest2233+teacher@gmail.com",
    password: "Testparola*",
  },
};
