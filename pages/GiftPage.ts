import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { clickWhenReady } from '../utils/clickWhenReady';

/**
 * /podarak-za-uchenik/ — buy a 12-month subscription as a gift (verified live 2026-10-07).
 * Logged in, the "Начин на плащане" section has one button per method: card
 * (`data-qa="select_payment_3"`), cash/EasyPay (`_2`) and ePay (`_4`). Card goes straight to
 * FIBank ("Закупуване на подарък - 12 месеца абонамент"), then to
 * /payment/final/success?invoice_id=… — the buyer gets the code, NOT a subscription.
 * The code is listed on the buyer's /profile/subscription/ under "Твоите закупени подаръци"
 * ("КОД ЗА ПОДАРЪК: 38820002", 8 digits) and redeemed by anyone on /promo (see PromoPage).
 */
export class GiftPage extends BasePage {
  readonly payByCardButton: Locator;
  readonly payByCashButton: Locator;
  readonly payByEpayButton: Locator;
  readonly successMessage: Locator;
  readonly giftLink: Locator;

  constructor(page: Page) {
    super(page);

    this.payByCardButton = page.locator('[data-qa="select_payment_3"]');
    this.payByCashButton = page.locator('[data-qa="select_payment_2"]');
    this.payByEpayButton = page.locator('[data-qa="select_payment_4"]');
    this.successMessage = page.locator('#wrap');
    this.giftLink = page.locator('#wrap a[href*="/profile/gifts/"]');
  }

  async goto() {
    await this.page.goto('/podarak-za-uchenik/');
  }

  /** Clicks "Плати с карта" and waits for FIBank's checkout (click handler binds late, so retry). */
  async startCardPurchase() {
    await clickWhenReady(this.payByCardButton, () => this.page.waitForURL(/mdpay-test\.fibank\.bg/, { timeout: 15000 }));
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /** Reads the newest gift code from the buyer's /profile/subscription/ page. */
  async readPurchasedGiftCode(): Promise<string> {
    await this.page.goto('/profile/subscription/');
    const text = await this.page.locator('#wrap').innerText();
    const codes = [...text.matchAll(/КОД ЗА ПОДАРЪК:\s*(\d+)/g)].map((m) => m[1]);
    if (!codes.length) throw new Error('No "КОД ЗА ПОДАРЪК" on /profile/subscription/');
    return codes[codes.length - 1];
  }
}
