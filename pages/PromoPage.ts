import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { clickWhenReady } from '../utils/clickWhenReady';

/**
 * /promo — "Активирай своя абонамент!": redeem a subscription code (gift codes, promo codes).
 * Reached from /profile/subscription/ → "Активирай код за абонамент". Verified live
 * 2026-10-07: `#input_voucher` (maxlength 10) + "Активирай абонамент" (#save-data) post
 * /promo via AJAX; success replaces the form with "Поздравления! Твоят абонамент е
 * активиран!", an unknown code shows `.voucher-error`.
 */
export class PromoPage extends BasePage {
  readonly codeInput: Locator;
  readonly activateButton: Locator;
  readonly error: Locator;
  readonly content: Locator;

  constructor(page: Page) {
    super(page);

    this.codeInput = page.locator('#input_voucher');
    this.activateButton = page.locator('#save-data');
    this.error = page.locator('.voucher-error');
    this.content = page.locator('#wrap');
  }

  async goto() {
    await this.page.goto('/promo');
  }

  async activate(code: string) {
    await this.codeInput.fill(code);
    await clickWhenReady(this.activateButton, () =>
      this.page.waitForResponse((r) => r.url().endsWith('/promo') && r.request().method() === 'POST', { timeout: 10000 })
    );
  }
}
