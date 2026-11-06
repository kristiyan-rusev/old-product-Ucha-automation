import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { clickWhenReady } from '../utils/clickWhenReady';

export type KeysPackage = '80' | '20' | '3';

// `data-id`s of the key packages on /keys/ (verified live 2026-10-07) — "80" is 60 + 20 free.
const PACKAGE_IDS: Record<KeysPackage, string> = { '80': '7', '20': '6', '3': '5' };

/**
 * Chemistry keys for university candidates ("Ключове по химия за кандидат-студенти") — a
 * separate product from the subscription: one key unlocks one /watch/ video of
 * /videos/himiya-kandidat-studenti/ for 3 months.
 *
 * /my-keys/ ("Моите ключове…"): "Оставащи ключове: N", the unlocked videos, and "Зареди
 * ключове" → /keys/. /keys/ uses the same package/payment card pattern as /subscription/:
 * packages 60+20 (default, 61,36 €), 20 and 3 (7,67 €); payment card (default) / cash /
 * ePay; "Зареди ключове" (#subscribe-button) → FIBank ("Активиране на N ключа…") →
 * /payment/final/success ("Браво! Ти успешно закупи …").
 */
export class ChemistryKeysPage extends BasePage {
  readonly orderSummary: Locator;
  readonly buyButton: Locator;
  readonly remainingKeys: Locator;
  readonly content: Locator;

  constructor(page: Page) {
    super(page);

    this.orderSummary = page.locator('#wrap');
    this.buyButton = page.locator('#subscribe-button');
    this.remainingKeys = page.locator('#wrap').getByText(/Оставащи ключове:\s*\d+/);
    this.content = page.locator('#wrap');
  }

  async gotoBuy() {
    await this.page.goto('/keys/');
  }

  async gotoMyKeys() {
    await this.page.goto('/my-keys/');
  }

  packageCard(pkg: KeysPackage): Locator {
    return this.page.locator(`[data-id="${PACKAGE_IDS[pkg]}"][data-object_type="package"]`);
  }

  async selectPackage(pkg: KeysPackage) {
    if (pkg === '80') return; // the default
    await clickWhenReady(this.packageCard(pkg), () =>
      this.page.locator(`[data-id="${PACKAGE_IDS[pkg]}"][data-object_type="package"].selected`).waitFor({ state: 'visible', timeout: 5000 })
    );
  }

  /** "Зареди ключове" with card payment (the default) → FIBank's checkout. */
  async proceedToCardCheckout() {
    await clickWhenReady(this.buyButton, () => this.page.waitForURL(/mdpay-test\.fibank\.bg/, { timeout: 15000 }));
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }
}
