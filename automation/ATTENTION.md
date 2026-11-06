# Needs human attention

Escalation notes from autonomous sessions — things that don't fit cleanly into
`HEALING_LOG.md` (a fix that wasn't safe to auto-apply) or that invalidate an assumption
the backlog was relying on. Written when `OPERATING_PROCEDURE.md`'s escalation rule fires:
log it plainly here, do the minimal safe no-op, move on — never creatively reinterpret the
backlog instead.

Each entry: timestamp, what happened, what was done instead (skipped item / `test.fixme()`
/ paused), and what a human should look at.

---

**2026-10-28 — Test accounts with a monthly-payment plan can't be deactivated; they need an admin.**
The site rule "Не можеш да деактивираш профила си, докато имаш активен абонамент с плащане на
месец!" blocks deactivation from the profile while an installment plan is active. All other test
accounts are now deactivated (≈360 today) and tests clean up after themselves, but these stay:
- 13 old accounts (`kristest2233+sub12inst…` / `+sub24inst…`), listed in
  `test-data/created-accounts.log` with the tag `ucha-dev-monthly-plan`;
- every run of the two tests that buy a monthly plan (12- and 24-month installment, in
  subscription-purchase.spec.ts and subscription-durations.spec.ts) adds one more each — they
  use a new address per run (`registerAndLogin(..., { monthlyPlan: true })`) because the old one
  can't be freed; the MultiSport story's installment variants do the same.
`scripts/cleanup-accounts.ts` reports them as `blocked-monthly-plan` and keeps them in the log.

What a human should decide: is there an admin way to end a test account's installment contract
or deactivate it (then the cleanup could do it too), and should the two monthly-plan purchase
tests run on every run or only occasionally (e.g. not in night runs)?

---

**2026-09-16 — `scripts/cleanup-accounts.ts` cannot deactivate "profiledata"-labeled accounts.**
**Resolved 2026-10-28:** not a rate limit. Once an account's phone has been verified (editing
personal data does that), the deactivation popup sends the code by itself and shows the code
input straight away — there's no "Изпрати код" button, and `verifyWithCode` waited 30 s for
it. It now handles both versions of the popup; a profiledata account deactivated fine.

Across three separate cleanup runs over two days (2026-09-15 and 2026-09-16), the exact
same set of throwaway accounts created by the personal-data profile-settings test
(`profile-settings.spec.ts`'s "profiledata" label) have consistently failed the cleanup
script's deactivation flow, while every other account type (registration, school-class,
password-change, login-email, etc.) cleans up normally. This looks like a real pattern, not
generic flakiness — the same specific accounts persist unresolved across runs rather than
succeeding on a later retry.

Working theory, unconfirmed: the personal-data test itself already consumes one SMS
verification-code round trip (for its own mandatory phone re-verification step) before the
account is ever handed to cleanup, and cleanup's deactivation flow needs a second SMS code
request. If there's a rate limit tied to the shared dummy phone number (`888123456`, used by
every test account), accounts that already went through one verification cycle may be more
likely to fail the next one. Not verified — no rate-limit-specific error text was observed,
only generic Playwright timeouts matching what unrelated dev-server-load flakiness also
looks like.

What was done: nothing — the affected accounts stay in `test-data/created-accounts.log`,
kept for retry by the cleanup script's existing design (never resolved, but harmless —
disposable dev-only accounts).

What a human should look at: whether the dev environment applies any SMS-verification rate
limiting per phone number, and if so, whether that's expected/documented behavior or worth
adjusting for testing purposes.

---

**2026-10-07 — A declined FIBank card payment lands on `/payment/final/success`.**
With set-data's FIBank simulation on "изтекла карта", paying a 12-month subscription by card
redirects back to `https://t.ucha.dev/payment/final/success?invoice_id=…` — the page itself
says "Неуспешно завършена поръчка! Няма извършена трансакция…", payment history shows
"Статус: Отказана поръчка" and no subscription is activated, so the failure is handled; only
the URL says "success".

What was done: tests/subscription/payment-results.spec.ts asserts the page content and the
history entry, not the URL (comment points here).

What a human should look at: whether the failure should redirect to a /payment/final/fail-style
URL — it matters for analytics/conversion tracking that keys off the success URL.
