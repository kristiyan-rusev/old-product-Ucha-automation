# Self-healing audit log

One entry per automatically-applied fix. Traces/screenshots in `test-results/` are
gitignored and get overwritten by the next run, so each entry must contain enough (the
actual error text and/or relevant DOM snippet) to reconstruct the reasoning without them.

Never log an entry for a fix you didn't actually verify (re-ran the specific test AND the
full suite, both green) before committing — see `OPERATING_PROCEDURE.md`.

Template for each entry:

```
## <ISO timestamp> — <file changed>

- **Test:** <spec file + test name that was failing>
- **Category:** stale-selector | timing | strict-mode
- **Error (verbatim):**
  ```
  <the actual Playwright error text>
  ```
- **Change:** `<old selector/code>` → `<new selector/code>`
- **Why:** <what you found on the live page that justified this>
- **Verified:** specific test passed; full suite passed (N/N)
- **Commit:** <sha>
```

---

## 2026-09-23 — pages/SubscriptionPage.ts

- **Test:** tests/subscription/subscription-purchase.spec.ts — "EasyPay (\"В брой\") shows a
  pending order with a payment code, not an active subscription"
- **Category:** strict-mode
- **Error (verbatim):**
  ```
  Error: expect(locator).toContainText(expected) failed
  Locator: locator('#payment-help-details')
  Expected substring: "Поръчката Ви беше приета успешно"
  Error: strict mode violation: locator('#payment-help-details') resolved to 2 elements:
      1) <div class="pt-4 pt-md-8" id="payment-help-details">…</div> aka locator('#payment-help-details').first()
      2) <div id="payment-help-details" class="container-fluid fluid-side-padding mt-md-5 mt-4 mb-8">…</div> aka locator('#payment-help-details').nth(1)
  ```
- **Change:** `page.locator('#payment-help-details')` → `page.locator('#payment-help-details').first()`
- **Why:** Confirmed on the live `/pay_final.php` page (a real duplicate-`id` markup bug, not
  a test issue) — two unrelated blocks share the id: the first (DOM order) is the actual
  success heading ("Поръчката Ви беше приета успешно!"), the second is an unrelated
  "possible payment methods" info block further down the page. Verified which was which by
  reading the captured DOM before narrowing, per the "never resolve a strict-mode violation
  with .first()/.nth() blindly" rule.
- **Verified:** specific test passed (37.8s); full `tests/subscription` suite passed
  (7 passed, 1 flaky — see note below, all 8 ultimately green); full `tests/auth` suite
  passed (30/30).
- **Commit:** (this commit)

## 2026-09-23 — tests/subscription/subscription-purchase.spec.ts

- **Test:** same test as above — "EasyPay (\"В брой\") shows a pending order with a payment
  code, not an active subscription"
- **Category:** stale-selector (assertion, not selector — see note)
- **Error (verbatim):**
  ```
  Error: expect(locator).toHaveText(expected) failed
  Locator: locator('.easypay-heading-div .text-jane')
  Expected pattern: /^\d{10}$/
  Received string:  "
                              3628185070
                          "
  ```
- **Change:** `toHaveText(/^\d{10}$/)` → `toContainText(/\d{10}/)`
- **Why:** The locator and value were already correct — the code itself is a real 10-digit
  string. `toHaveText()` does not normalize surrounding whitespace/newlines for a regex the
  way it does for a plain string, so the live markup's leading/trailing whitespace around
  the text node failed the strict `^...$` anchors. Not a page issue — the assertion was too
  strict for the real markup shape.
- **Verified:** specific test passed (37.8s, same run as above); full `tests/subscription`
  suite passed; full `tests/auth` suite passed (30/30).
- **Commit:** (this commit)

**Update:** the ePay flakiness noted below was initially assumed to be ordinary
click-handler-binds-late flakiness tolerated by the existing retry policy — a follow-up
session (same day) found and fixed the real root cause instead. See the entries below.

**2026-09-23 (original note, superseded) — ePay flakiness observed, no code change at the time:**
`subscription-purchase.spec.ts`'s ePay test failed once with `TimeoutError:
page.waitForURL: Timeout 15000ms exceeded` on the redirect from `#subscribe-button` to
`demo.epay.bg`, then passed cleanly on Playwright's own config-level retry (`retries: 1`)
both times this was observed across two separate full runs. Assumed at the time to match
the site's documented click-handler-binds-late race (`retryClick.ts`'s doc comment) on an
external cross-origin redirect — turned out to be a different, more specific bug; see below.

## 2026-09-23 — pages/SubscriptionPage.ts (goto, selectPaymentMethod)

- **Test:** subscription-purchase.spec.ts's ePay test, while extending it to complete a real
  payment via user-provided demo.epay.bg credentials (wv-customer). Root-causing the
  flakiness noted above.
- **Category:** timing (but not the usual click-handler-binds-late one — see Why)
- **Error (verbatim):**
  ```
  TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  waiting for navigation until "load"
      navigated to "https://mdpay-test.fibank.bg/ecomm_v2/ClientHandler"
  ```
  (a bare, non-retried click on `#subscribe-button` right after selecting epay — used only
  to isolate the race, not part of the real code path — landed on FIBank/card checkout
  instead of epay, proving the click registered under the *previous* payment method)
- **Change:**
  - `SubscriptionPage.goto()` now waits for `POST /payment/subscription/load-payments` to
    resolve before returning (was: no wait at all beyond the page's own `load` event).
  - `selectPaymentMethod()` now waits for `#selected-payment-label`'s text to actually match
    the new method (was: only waited for the clicked card's own `.selected` CSS class).
- **Why:** Instrumented the DOM directly (polling the epay card's class/label every 200ms
  after a bare click) and found the card's `.selected` class and `#selected-payment-label`
  text never changed at all across 4 seconds when the click landed before
  `/payment/subscription/load-payments` resolved — a real, separate async call the page
  fires after its initial HTML renders, gating which payment methods are actually
  selectable. This is a coarser-grained version of the site's usual "handler binds late"
  quirk, not the same click-and-retry race `retryClick` already handles — a longer or
  retried click on an element that is fully non-interactive yet doesn't help; waiting for the
  concrete signal (the load call, then the label text actually updating) does. A fixed
  800ms settle wait was tried first and did not reliably fix it (confirmed by reproducing
  the failure again with it in place) — replaced with the two waits above once the real
  cause was found.
- **Verified:** full `tests/subscription` suite passed 8/8 (including EasyPay and ePay
  fully completing real payments end-to-end via user-provided credentials); full
  `tests/auth` suite passed 30/30.
- **Commit:** (this commit)

## 2026-09-23 — tests/subscription/subscription-purchase.spec.ts (test-authored bug, not a page/site issue)

- **Test:** EasyPay full-completion test, first attempt at extending it to actually settle
  the order via EasyPay's own demo bill-payment simulator (`demo.epay.bg/ezp/pay_bill.cgi`,
  provided by the user).
- **Category:** flow-state anomaly (the test's own sequencing, not a selector/timing issue)
- **Error (verbatim):**
  ```
  Test timeout of 120000ms exceeded.
  Error: locator.textContent: Test timeout of 120000ms exceeded.
  Call log:
    - waiting for locator('.easypay-heading-div .text-jane')
  ```
- **Change:** the test navigated to `/profile/subscription/` (to assert the order is still
  pending) *before* calling `completeEasyPayViaDemoTerminal()`, which tried to read the
  10-digit code from `.easypay-heading-div .text-jane` — an element that only exists on
  `/pay_final.php`, not on the page the test had already navigated away to. Fixed by reading
  the code into a variable before navigating away, and changing
  `completeEasyPayViaDemoTerminal()` to take the code as a parameter instead of assuming it
  can re-read it from the current page.
- **Why:** a plain "locator never appears" timeout that could look like a stale selector at
  a glance, but confirming actual page state first (per the self-healing classification)
  showed the test simply weren't on the right page anymore when it tried to read the
  locator — a bug in the new test code, not the page object or the site.
- **Verified:** full `tests/subscription` suite passed 8/8; full `tests/auth` suite passed
  30/30.
- **Commit:** (this commit)

## 2026-09-23 — pages/SubscriptionPage.ts (waitForActiveSubscription)

- **Test:** both EasyPay and ePay full-completion tests, same round as above.
- **Category:** timing (backend activation lag, not a UI race)
- **Error (verbatim):**
  ```
  Error: expect(locator).not.toContainText(expected) failed
  Locator: locator('body')
  Expected substring not: "Активирай абонамент сега"
  ```
- **Change:** replaced a single `page.goto('/profile/subscription/')` +
  `expect(...).not.toContainText(...)` right after each gateway confirmed payment with a new
  `waitForActiveSubscription()` method that polls the page (re-navigating each time, since
  the "no active subscription" text is only updated on a fresh load) every 2s for up to 20s.
- **Why:** confirmed live (during manual exploration before writing the fix) that both
  gateways' payment confirmation and this site's own subscription activation are not the
  same instant — a single check immediately after the gateway redirects back can observe
  stale, still-inactive state for a few seconds. A plain assertion retry doesn't help here
  since the page was already loaded before the backend caught up; re-navigating on each poll
  does.
- **Verified:** full `tests/subscription` suite passed 8/8 (both tests activated correctly
  within the poll window); full `tests/auth` suite passed 30/30.
- **Commit:** (this commit)
