# Autonomous operating procedure

Followed when the user says to work through the backlog unattended for an extended
stretch, instead of the normal turn-by-turn "what should we build next" flow. This is a
single continuous session — not a scheduled/cron loop — so "one cycle" below just means
"the next thing to do next," repeated for as long as the session runs.

## Before starting

- Confirm the working tree is clean or explainable:
  - If `git status` shows uncommitted changes that look like a half-finished unit of work
    from a prior run (matches the shape of one in-progress backlog item, nothing
    unrelated) — finish, verify, and commit it, or cleanly `git checkout --` it, before
    starting anything new.
  - If it shows changes that don't look like that (unrelated files, mid-edit state that
    doesn't match any backlog item) — assume it's the user's own in-progress work. Leave
    it alone. Note it in `ATTENTION.md` and stop rather than building on top of it blindly.
- Confirm `tests/auth` is green right now (`npx playwright test tests/auth --project=ucha-dev --reporter=list`)
  before picking up new work — never add coverage on top of a suite that's already red for
  reasons other than the environment being down.

## One cycle

1. **Environment check, always first.** `curl -s -o /dev/null -w "%{http_code}" <baseURL>`.
   Also fetch the body and check it isn't the Cloudflare/hosting-panel placeholder page
   ("Softaculous Webuzo | Default Website Page" — seen when the dev/staging VPN is down).
   Either signal means "environment down": do not run tests, do not attempt healing, note
   it, wait a few minutes, check again. This check exists because a down environment looks
   *exactly* like every test failing at once, which is not what it means.
2. **Run the full suite:** `npx playwright test tests/auth --project=ucha-dev --reporter=list`.
3. **If anything failed** → go to "Self-healing" below. Do not proceed to new coverage work
   until the suite is green again (or the failure has been explicitly escalated to
   `ATTENTION.md`/`test.fixme()` rather than silently left red).
4. **If everything passed** → take the next unchecked item in `BACKLOG.md` and do one full
   unit of work:
   - Explore the live site for whatever this item needs (curl the real pages, grep for the
     actual DOM structure — the same process used to build everything so far; never guess
     at selectors or URLs).
   - Build/extend the relevant page object (`pages/*.ts`), reusing `retryClick` for any
     click that triggers a network/JS-driven effect (this site's click handlers bind async
     after page load — see `utils/retryClick.ts`'s doc comment).
   - Write the test, run it against `ucha-dev`, fix anything that doesn't work first try.
   - Run the *full* suite again to confirm no regression.
   - `git commit` (one commit per completed backlog item; message describes what was added).
   - Check the item off in `BACKLOG.md`, commit that too (can combine with the above commit).
5. **Periodically** (roughly every 10 full-suite runs): run `scripts/cleanup-accounts.ts`
   to deactivate accumulated throwaway test accounts, and prune old `test-results/` /
   `playwright-report/` content so disk usage doesn't grow unbounded over a long session.
6. Repeat from step 1.

## Self-healing

A failure is not automatically "a broken selector." Classify it before touching anything:

1. **Confirm actual page state first.** Before considering any selector change, check
   what's actually on the page right now (screenshot or DOM dump). If the page isn't on the
   expected route/step, or shows an error banner, that's a **flow-state anomaly** — treat it
   exactly like a real product bug (see #5). This matters because the dev server has been
   observed kicking the registration wizard back to step 1 under load, which throws the
   *identical* "locator never appeared" error a genuinely stale selector would — the only
   way to tell them apart is to look at what page you're actually on.
2. **Stale selector** (confirmed: right page/step, the expected element just isn't there
   under the old selector) → safe to fix. Re-derive the correct selector from the live DOM
   the same way every selector in this project was originally found (curl + grep, or a
   quick Playwright script to inspect the real markup). Never guess.
3. **Timing** (the element eventually appears if you wait longer — this site's known
   click-handler-binds-late quirk) → wrap the click in `retryClick`, don't change the
   selector. Confirm the "eventually appears on a longer wait" precondition before treating
   it as a timing issue rather than reaching for this as a default response to any timeout.
4. **Strict-mode violation** (locator resolves to 2+ elements) → never resolve with
   `.first()`/`.nth()` alone. Confirm which match is the semantically correct one (by role,
   label, or visible text) before narrowing the locator.
5. **Assertion-content mismatch** (the flow completed, but an expected value/text doesn't
   match) → never "fixed" by loosening the assertion. This is what a real regression looks
   like. Write a note to `ATTENTION.md`, mark the test `test.fixme()` with a comment
   explaining what changed, and move on.

For any fix in categories 2-4:
- Re-run the specific test, then the full suite, both green, before committing.
- Log it in `HEALING_LOG.md` (see that file's template) in the same commit as the fix.
- **No second silent fix.** If a test that already has a `HEALING_LOG.md` entry fails again
  later, don't attempt another automatic fix — the first one was likely wrong or masked
  something. Escalate to `ATTENTION.md` referencing the prior fix's commit instead.
- Cap: at most 2 fix attempts for a given test in a session (the "no second silent fix on a
  previously-healed test" rule above will usually fire first in practice).

## Escalation

If something invalidates an assumption mid-session — a backlog item no longer makes sense
given the current site, the environment stays down far longer than a VPN blip would
explain, Jira/Gmail access breaks, anything that isn't covered by the rules above — do not
creatively reinterpret the backlog or guess at a workaround. Write a plain note to
`ATTENTION.md`, do the minimal safe no-op for that specific item, and continue with
whatever else is still safe to do.

## Stopping

Stop and leave a short summary (what got done, what's in `HEALING_LOG.md`/`ATTENTION.md`,
what's next in `BACKLOG.md`) when any of:
- The backlog is fully checked off.
- Roughly 1.5-2 hours of active work have passed.
- Three consecutive cycles found nothing productive to do (environment down each time, or
  nothing to heal and backlog empty).
