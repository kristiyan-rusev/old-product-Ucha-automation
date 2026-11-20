import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { clickWhenReady, waitUntilClickable } from '../utils/clickWhenReady';

/**
 * Admin → "Зареждане на пакети" (/admin/payment-load/packages): loads a subscription package onto one
 * account for free (automation/ADMIN.md). After the page load every step is AJAX into #subscription:
 * "Проверете" (the account, "Последен абонамент:", "Хронология на плащания") → "Изберете пакет" +
 * "Изберете" → the payment methods → a method's preview ("Период на абонамента", "Активен до",
 * "Основание на плащането") → "Зареди!". Only "Зареди!" changes anything. Its box "Успешно зареден акаунт"
 * shows even when the load failed inside, so a test checks the account's data afterwards.
 */
export class AdminPaymentLoadPage extends BasePage {
  static readonly PATH = '/admin/payment-load/packages';
  /** The "1 месец" package (`choose_package` value). */
  static readonly ONE_MONTH = '13';
  /** "Подарък от Уча.се": only the subscription, its payment record and a bell notification — no email,
   *  no auto-renewal change, no voucher (PaymentUser::chargeFreePayment). */
  static readonly GIFT_FROM_UCHA = 5;

  readonly emailInput: Locator;
  readonly checkButton: Locator;
  readonly info: Locator;
  readonly lastSubscription: Locator;
  readonly history: Locator;
  readonly packageSelect: Locator;
  readonly chooseButton: Locator;
  readonly loadButton: Locator;
  readonly successBox: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[name="email"]');
    this.checkButton = page.locator('#check-email');
    this.info = page.locator('#subscription');
    this.lastSubscription = this.info.locator('.account-row').filter({ hasText: 'Последен абонамент:' });
    this.history = this.info.locator('#payment-admin-history');
    this.packageSelect = page.locator('select[name="choose_package"]');
    this.chooseButton = page.getByRole('button', { name: 'Изберете', exact: true });
    // An <input type=button> the page's JS appends under the preview.
    this.loadButton = this.info.getByRole('button', { name: 'Зареди!' });
    this.successBox = this.info.getByText('Успешно зареден акаунт');
  }

  async goto() {
    await this.page.goto(AdminPaymentLoadPage.PATH);
  }

  /** Waits for the step's AJAX POST to `path` (exactly) — the next step needs its answer. */
  private posted(path: string) {
    return this.page.waitForResponse(
      (r) => new URL(r.url()).pathname === path && r.request().method() === 'POST',
      { timeout: 120_000 }
    );
  }

  /** "Въведете email" → "Проверете": the account's data replaces the right panel. */
  async checkEmail(email: string) {
    await this.emailInput.fill(email);
    await waitUntilClickable(this.checkButton);
    await Promise.all([this.posted('/admin/payment-load'), this.checkButton.click()]);
  }

  /** "Изберете пакет" → "Изберете": the payment methods for that package. */
  async choosePackage(value: string) {
    await this.packageSelect.selectOption(value);
    await clickWhenReady(this.chooseButton, () => this.posted('/payment/payment-type/get-load-methods'));
  }

  /** A payment method by its payment type id (`.option-<id>`). */
  method(typeId: number) {
    return this.info.locator(`.payment-method.option-${typeId}`);
  }

  /** Clicks a method: its preview replaces the panel. */
  async chooseMethod(typeId: number) {
    await clickWhenReady(this.method(typeId), () => this.posted('/payment/payment-type/choose-method'));
  }

  /** A preview row's value, by its label. */
  preview(label: string) {
    return this.info.locator('.payment-details').filter({ has: this.page.locator('.data-label', { hasText: label }) }).locator('.data-info');
  }

  /** "Зареди!" — loads the package. Clicked once only: a second click would load it twice. */
  async load() {
    await this.loadButton.waitFor({ state: 'visible' });
    await Promise.all([this.posted('/admin/payment-load'), this.loadButton.click()]);
  }
}
