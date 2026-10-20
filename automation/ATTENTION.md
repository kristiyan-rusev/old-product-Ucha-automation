# Needs human attention

Escalation notes from autonomous sessions — things that don't fit cleanly into
`HEALING_LOG.md` (a fix that wasn't safe to auto-apply) or that invalidate an assumption
the backlog was relying on. Written when `OPERATING_PROCEDURE.md`'s escalation rule fires:
log it plainly here, do the minimal safe no-op, move on — never creatively reinterpret the
backlog instead.

Each entry: timestamp, what happened, what was done instead (skipped item / `test.fixme()`
/ paused), and what a human should look at.

---

**2026-09-16 — `scripts/cleanup-accounts.ts` cannot deactivate "profiledata"-labeled accounts.**
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
