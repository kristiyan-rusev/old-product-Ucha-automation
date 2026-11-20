import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { clickWhenReady } from '../utils/clickWhenReady';

/**
 * /profile/subscription/ for a prepaid subscription (verified live 2026-11-02, fresh student with a
 * 12-month card purchase, then set-data "Промяна на дни активност" = 3 and -2):
 * - active: `#prepayed-subscription.is-all-active`, status "Активен";
 * - 3 days left: `.is-expiring` with the banner "Абонаментът ти изтича скоро!", status "Изтичащ";
 * - expired: the whole card is replaced by `#no-subscription-cta` ("Активирай абонамент сега и учи
 *   бързо и лесно!").
 */
export class ProfileSubscriptionPage extends BasePage {
  readonly subscriptionCard: Locator;
  readonly status: Locator;
  readonly validUntil: Locator;
  readonly daysLeft: Locator;
  readonly expiringBanner: Locator;
  readonly noSubscriptionTitle: Locator;
  readonly extendButton: Locator;

  // A monthly plan ("С плащане на месец"), verified live 2026-11-02: the card is `#contract-subscription`.
  // - active (also with 1–4 overdue days): status "Активен", label "Плащаш на месец*" ("Плащаш на месец *" when overdue);
  // - more than 4 overdue days: status "Спрян" in red, the label becomes "Дължима сума".
  // "Следващо плащане" is the next installment's date (today once it is due).
  readonly contractCard: Locator;
  readonly contractStatus: Locator;
  readonly nextPayment: Locator;
  readonly monthlyPrice: Locator;
  readonly monthlyPriceBox: Locator;
  // /payment-history/ — the list of payments ("Месечно плащане на абонамент…", "Поръчка на абонамент…").
  readonly paymentHistory: Locator;
  // After a failed installment (verified live 2026-11-03, expired card): the card `#manual-charge-card` ("Имаш пропусната
  // месечна вноска") with only "Актуализирай картата си" — "Плати месечна вноска" (`#manual_charge_pay_button`) is offered
  // for insufficient funds alone, so an expired card can't be paid by hand.
  readonly missedInstallmentCard: Locator;
  readonly updateCardButton: Locator;
  readonly payInstallmentButton: Locator;
  // The link in the footer of the monthly plan's card (verified live 2026-11-03, a healthy monthly plan: a small link under
  // "Продължи абонамента"); it posts to /payment/payment-type/change-recurring and goes on to FIBank's card-settings page.
  readonly changeCardLink: Locator;
  readonly monthlyPriceEuro: Locator;
  // The "Автоматично подновяване на абонамент" block (verified live 2026-11-04): `#turn-recurring-off` is there while it is on,
  // `#recurring-table` holds "Дата на следващо автоматично подновяване" (after a failed renewal it moves to the retry date).
  readonly turnRecurringOffButton: Locator;
  readonly nextRenewalDate: Locator;
  // A monthly plan that runs out (verified live 2026-11-06, set-data "Промяна на оставащи дни по текущ абонамент на вноски"):
  // - up to 10 days left `#contract-subscription.is-expiring`: the banner "Абонаментът ти изтича скоро!", the plan line
  //   "С плащане на месец (валиден до dd.mm.yyyy г.)" and "Остават ти N дни" replace the status / next-payment / price boxes;
  // - run out: the card is replaced by `#no-subscription-cta` with "Избери абонамент" (→ /subscription/).
  readonly contractExpiringBanner: Locator;
  readonly contractPlan: Locator;
  readonly contractDaysLeft: Locator;
  readonly chooseSubscriptionLink: Locator;

  constructor(page: Page) {
    super(page);
    this.contractExpiringBanner = page.locator('#contract-subscription .expire-message');
    this.contractPlan = page.locator('#contract-subscription .your-subs-details');
    this.contractDaysLeft = page.locator('#contract-subscription .expire-info');
    this.chooseSubscriptionLink = page.locator('#no-subscription-cta').getByRole('link', { name: 'Избери абонамент' });
    this.turnRecurringOffButton = page.locator('#turn-recurring-off');
    this.nextRenewalDate = page.locator('#recurring-table .recurring-next .recurring-td');
    this.changeCardLink = page.locator('#change-card-link');
    this.monthlyPriceEuro = page.locator('#contract-subscription .subs-monthly-price .base-price');
    this.contractCard = page.locator('#contract-subscription');
    this.contractStatus = this.contractCard.locator('.subs-state');
    this.nextPayment = this.contractCard.locator('.subs-next-payment');
    this.monthlyPrice = this.contractCard.locator('.subs-monthly-price');
    // The box holding the price also holds its label ("Плащаш на месец" / "Дължима сума") — no id or data-qa on it.
    this.monthlyPriceBox = this.contractCard.locator('.subsc-inner-box').filter({ has: page.locator('.subs-monthly-price') });
    this.paymentHistory = page.locator('#payment-history-data');
    this.missedInstallmentCard = page.locator('#manual-charge-card');
    this.updateCardButton = page.locator('#manual_charge_update_card_button');
    this.payInstallmentButton = page.locator('#manual_charge_pay_button');
    this.subscriptionCard = page.locator('#prepayed-subscription');
    this.status = this.subscriptionCard.locator('.subs-state');
    this.validUntil = this.subscriptionCard.locator('.your-subs-details-bold');
    // The number is the first span in `.subs-days-left` (its colour class changes with the state), " дни" the second.
    this.daysLeft = this.subscriptionCard.locator('.subs-days-left > span:first-child');
    this.expiringBanner = this.subscriptionCard.locator('.expire-message');
    this.noSubscriptionTitle = page.locator('#no-subscription-cta .get-subscription-title');
    this.extendButton = page.locator('#extend-subscription');
  }

  async goto() {
    await this.page.goto('/profile/subscription/');
  }

  /** "Актуализирай картата си" → FIBank's card-settings page (the click posts via AJAX, then the page submits a form after a second). */
  async openCardUpdate() {
    await clickWhenReady(this.changeCardLink, () => this.page.waitForURL(/mdpay-test\.fibank\.bg/, { timeout: 20000 }));
  }

  async gotoPaymentHistory() {
    await this.page.goto('/payment-history/');
  }

  /**
   * "Изключи" next to the auto-renewal → /profile/recurring-off/ → "Изключи" → the confirmation dialog → "Да"
   * (same steps as tests/subscription/auto-renewal.spec.ts). Resolves once the site says it is off.
   */
  async turnAutoRenewalOff() {
    await this.page.locator('#turn-recurring-off').click();
    await this.page.waitForURL(/\/profile\/recurring-off\/$/);
    // The dialog is in the DOM (hidden) from page load and the button's handler binds late — wait for it to show.
    const dialog = this.page.locator('#modal-recurring-off');
    await clickWhenReady(this.page.locator('#switch-off-button'), () => dialog.waitFor({ state: 'visible', timeout: 5000 }));
    await dialog.getByText('Да', { exact: true }).click();
    await expect(this.page.locator('#wrap')).toContainText('Автоматичното подновяване на абонамента Ви е изключено.');
  }
}
