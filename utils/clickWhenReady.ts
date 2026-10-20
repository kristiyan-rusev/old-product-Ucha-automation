import { Locator, test } from '@playwright/test';

/**
 * Clicks a locator once the page can actually handle the click, and waits for its effect.
 *
 * Why: these PHP/jQuery sites bind most click handlers in `$(document).ready` (often as
 * delegated `$(document).on('click', '#id', …)`), and some controls only work once the
 * previous AJAX call has finished. A click that lands earlier is a silent no-op. The old
 * `retryClick` handled that by clicking, waiting for the effect's full timeout (5–15 s) and
 * clicking again; this instead waits — polling every animation frame — until the click
 * will do something, then clicks once. Readiness means all of:
 *   - the document has been parsed and jQuery has fired `ready`,
 *   - no jQuery AJAX request is in flight (`$.active === 0`),
 *   - the element (or, for a `<label>`, its control) has a handler: a jQuery handler on the
 *     element itself or delegated from an ancestor, an `onclick`, or native behaviour (a real
 *     link, a submit button inside a form, a form control).
 * A plain `addEventListener` handler can't be detected, so an element with no detectable
 * handler is treated as ready after `noHandlerGraceMs`. Readiness that never arrives isn't an
 * error by itself: after `readyTimeoutMs` it clicks anyway.
 *
 * As a safety net, if the effect still doesn't happen and the element is still on screen, it
 * clicks once more — and records a `click-retry` annotation on the test, so cases the
 * readiness check misses show up in the report instead of silently costing time.
 *
 * `waitForEffect` is started together with the click (`Promise.all`), not after it: a fast
 * response can otherwise finish before the listener is attached.
 */
export async function clickWhenReady(
  locator: Locator,
  waitForEffect: () => Promise<unknown>,
  { readyTimeoutMs = 5_000, noHandlerGraceMs = 1_000, attempts = 2 } = {}
) {
  for (let attempt = 1; ; attempt++) {
    await waitUntilClickable(locator, { readyTimeoutMs, noHandlerGraceMs });
    try {
      await Promise.all([waitForEffect(), locator.click()]);
      return;
    } catch (e) {
      if (attempt >= attempts || !(await locator.isVisible())) throw e;
      annotate('click-retry', `${locator} — no effect after click #${attempt}: ${(e as Error).message.split('\n')[0]}`);
    }
  }
}

/** Waits until a click on `locator` would be handled (see `clickWhenReady`), without clicking. */
export async function waitUntilClickable(
  locator: Locator,
  { readyTimeoutMs = 5_000, noHandlerGraceMs = 1_000 } = {}
) {
  await locator.waitFor({ state: 'visible' });
  const handle = await locator.elementHandle();
  try {
    await locator.page().waitForFunction(isClickHandled, { el: handle, noHandlerGraceMs }, {
      polling: 'raf',
      timeout: readyTimeoutMs,
    });
  } catch {
    const reason = await handle?.evaluate((el) => (el as any).__clickNotReadyReason).catch(() => 'unknown');
    annotate('click-not-ready', `${locator} — still "${reason}" after ${readyTimeoutMs} ms, clicked anyway`);
  } finally {
    await handle?.dispose();
  }
}

/** Runs in the page. Returns true once a click on `el` will be handled. */
function isClickHandled({ el, noHandlerGraceMs }: { el: any; noHandlerGraceMs: number }): boolean {
  const notReady = (reason: string) => {
    el.__clickNotReadyReason = reason;
    return false;
  };
  if (!el?.isConnected) return notReady('detached');
  if (document.readyState === 'loading') return notReady('document-loading');
  const $ = (window as any).jQuery;
  if ($) {
    if (!$.isReady) return notReady('jquery-not-ready');
    if ($.active > 0) return notReady('ajax-in-flight');
  }

  const targets = [el];
  if (el.tagName === 'LABEL' && el.control) targets.push(el.control);
  for (const t of targets) {
    if (t.onclick || t.hasAttribute('onclick')) return true;
    if (t.closest('a[href]:not([href^="#"]):not([href^="javascript"])')) return true;
    if (t.form && (t.type === 'submit' || t.type === 'image')) return true;
    if (t !== el && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return true;
    if ($) {
      const types = t === el ? ['click', 'mousedown', 'mouseup'] : ['click', 'change'];
      for (let n = t; n; n = n.parentNode) {
        const events = $._data(n, 'events') || {};
        for (const type of types) {
          for (const h of events[type] || []) {
            if (h.selector ? $(t).closest(h.selector, n).length : n === t) return true;
          }
        }
      }
    }
  }

  // Nothing detectable — maybe a native addEventListener handler. Give it a short grace.
  el.__noHandlerSince ??= performance.now();
  if (performance.now() - el.__noHandlerSince >= noHandlerGraceMs) return true;
  return notReady('no-handler');
}

function annotate(type: string, description: string) {
  try {
    test.info().annotations.push({ type, description });
  } catch {
    // called outside a test (e.g. a setup script) — nothing to annotate
  }
}
