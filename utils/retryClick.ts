import { Locator } from '@playwright/test';

/**
 * Clicks a locator and waits for an expected effect, retrying the click a few times if it
 * doesn't happen. Needed because some of this site's click handlers are bound via
 * `$(document).on(...)` after its JS bundle finishes loading and executing — a click that
 * lands before the handler is bound is a silent no-op, not an error, so there's nothing to
 * catch at the click itself. `waitUntil: 'networkidle'` on goto() was tried as a fix for this
 * but is unreliable on this site: continuous analytics/tracking requests (GA4, GTM, Convert.com,
 * a chat widget) mean the page can go a long time without ever reaching a true idle window.
 * Retrying the click directly addresses the actual race instead.
 *
 * `waitForEffect` is started together with the click via `Promise.all`, not after it —
 * started after, a fast response (e.g. `page.waitForResponse(...)`) can complete before the
 * listener is even attached, so the wait sees nothing, times out, and retries a click on a
 * button that already worked and is no longer on screen. This isn't hypothetical: it
 * reproduced when re-running an already-passing flow with `slowMo`, which shifted the
 * relative timing enough to expose it.
 */
export async function retryClick(
  locator: Locator,
  waitForEffect: () => Promise<unknown>,
  { attempts = 4, retryDelayMs = 500 }: { attempts?: number; retryDelayMs?: number } = {}
) {
  for (let i = 0; i < attempts; i++) {
    try {
      await Promise.all([waitForEffect(), locator.click()]);
      return;
    } catch (e) {
      if (i === attempts - 1) throw e;
      await locator.page().waitForTimeout(retryDelayMs);
    }
  }
}
