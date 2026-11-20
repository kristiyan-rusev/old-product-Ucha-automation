import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { clickWhenReady } from '../utils/clickWhenReady';
import { FibankCard, noteFibankDecline } from '../utils/fibankCards';

export type Duration = '6' | '12' | '24';
export type PaymentMethod = 'card' | 'cash' | 'epay';
export type ContractType = 'prepaid' | 'installment';

// Real `data-id`s confirmed live on /subscription/ (not guessable from the visible text) —
// duration packages and payment methods each reuse "4" for a different `data-object_type`,
// so every locator in this file pairs both attributes.
const DURATION_IDS: Record<Duration, string> = { '6': '10', '12': '4', '24': '19' };
const PAYMENT_IDS: Record<PaymentMethod, string> = { cash: '2', card: '3', epay: '4' };
// #selected-payment-label's text per method, confirmed live — see selectPaymentMethod()'s
// doc comment for why this (not the card's own .selected class) is what's actually waited on.
const PAYMENT_LABELS: Record<PaymentMethod, string> = { cash: 'в брой', card: 'с карта', epay: 'чрез ePay' };

/**
 * /subscription/ (plan selection) — the shared, reusable purchase flow behind almost every
 * other feature (campaign codes, gifts, MultiSport) that needs "an account with a
 * subscription" to test against. Meant to be imported by future story-specific folders via
 * a relative path (`../../pages/SubscriptionPage`), the same way `RegistrationPage` and
 * `LoginPage` already are — never copy/fork this file into a story folder.
 *
 * Defaults on page load: 12-month package, card payment, prepaid contract — already
 * MultiSport-eligible and the "80% избират" (most popular) combination, so a bare
 * `proceedToCheckout()` with no prior selection exercises exactly that baseline path.
 */
export class SubscriptionPage extends BasePage {
  readonly subscribeButton: Locator;
  // Clicking a radio's own (visually empty) <label> is a no-op — confirmed live, same
  // "click anywhere on the card" pattern as elsewhere on this site. The click handler is
  // bound to the whole `[data-id][data-object_type]` card div.
  readonly durationCards: Record<Duration, Locator>;
  readonly paymentCards: Record<PaymentMethod, Locator>;
  readonly contractCards: Record<ContractType, Locator>;

  // Selected-plan summary panel (right-hand side), useful for price/duration assertions.
  readonly selectedTime: Locator;
  readonly payFor: Locator;
  readonly payMonthly: Locator;
  readonly selectedPayment: Locator;

  // "+ 1 подарък" on a duration card: offered while a subscription is active or expiring, gone once it expired
  // (checked live 2026-11-02; the cards then also change data-id, e.g. 12 months 15 → 4).
  readonly giftOffers: Locator;

  // /subscription/ while a subscription is running: "Удължавате сегашния си абонамент, без да губите дни, до
  // <date>" (from the source template select_option_subscription_extension_text) — the date follows the selected package.
  readonly extensionNote: Locator;
  readonly extensionEndDate: Locator;

  // With a streak discount on the account: the banner "Използваш отстъпка от N% от редовната цена…", the
  // struck-through full price of the selected package (#info-price) and next to it the reduced one.
  readonly discountNotice: Locator;
  readonly fullPrice: Locator;
  readonly discountedPrice: Locator;

  // /profile/subscription/ — the status next to "Твоят абонамент е" (Активен / Изтичащ / Спрян).
  readonly subscriptionStatus: Locator;

  // /payment-contract — installment ("Плащане на месец") only, never shown for prepaid:
  // parent/guardian details required before FIBank, confirmed live by SMS to the given
  // phone (the dev-environment 111111 bypass applies).
  readonly contractFullNameInput: Locator;
  readonly contractPhoneInput: Locator;
  readonly contractTermsLabel: Locator;
  readonly contractPrivacyLabel: Locator;
  readonly contractGuardianLabel: Locator;
  readonly contractForwardButton: Locator;
  readonly contractCodeModal: Locator;
  readonly contractCodeInput: Locator;
  readonly contractCodeConfirmButton: Locator;

  // FIBank's own page (different origin, mdpay-test.fibank.bg) — fields confirmed live.
  readonly cardNameInput: Locator;
  readonly cardNumberInput: Locator;
  readonly expiryMonthSelect: Locator;
  readonly expiryYearSelect: Locator;
  readonly cvcInput: Locator;
  readonly payButton: Locator;
  // Same form when turning auto-renewal back on, but the submit says "Включете".
  readonly enableRecurringButton: Locator;
  // "Актуализирай картата си" of a monthly plan (verified live 2026-11-03): the same form on FIBank's "Настройки на данните на
  // банкова карта" page, submit "Запазете", ends on /payment/final/success ("Успешна промяна!") with a small table.
  readonly saveCardButton: Locator;
  readonly cardUpdateResult: Locator;
  readonly cardUpdateNextPayment: Locator;
  readonly cardUpdateType: Locator;
  readonly cardUpdateLast4: Locator;

  // EasyPay ("В брой") confirmation page (`/pay_final.php` on our own origin) — a *pending*
  // order until actually paid. `completeEasyPayViaDemoTerminal()` pays it for real via
  // EasyPay's own demo bill-payment simulator (a real, separate ePay.bg property, distinct
  // from the ePay checkout gateway below) at `demo.epay.bg/ezp/pay_bill.cgi`.
  readonly easyPaySuccessHeading: Locator;
  readonly easyPayCode: Locator;

  // demo.epay.bg/ezp/pay_bill.cgi — EasyPay/B-Pay's own bill-payment simulator (confirmed
  // live, provided by the user): takes the 10-digit code from the page above and actually
  // settles the order, at which point our own site activates the subscription for real.
  readonly easyPayTerminalCodeInput: Locator;
  readonly easyPayTerminalRetrieveButton: Locator;
  readonly easyPayTerminalPayButton: Locator;

  // demo.epay.bg — the ePay checkout gateway `epay` redirects to (a different demo.epay.bg
  // flow than the bill-payment simulator above: this one is the actual customer-facing
  // checkout, reached via #subscribe-button, not visited directly).
  readonly epayUsernameInput: Locator;
  readonly epayPasswordInput: Locator;
  readonly epayLoginSubmitButton: Locator;
  readonly epayConfirmPaymentButton: Locator;
  readonly epayContinueLink: Locator;

  constructor(page: Page) {
    super(page);

    this.subscribeButton = page.locator('#subscribe-button');
    this.giftOffers = page.locator('#subscription-page .month-gift-text');
    this.extensionNote = page.locator('#info-current-next');
    this.extensionEndDate = page.locator('#subscription-will-be-active-until');
    this.discountNotice = page.getByText(/Използваш отстъпка от \d+%/);
    this.fullPrice = page.locator('#info-price .base-price');
    this.discountedPrice = page.locator('#info-price-with-discount .base-price');
    this.subscriptionStatus = page.locator('p').filter({ hasText: 'Твоят абонамент е' }).locator('.subs-state');
    this.durationCards = {
      '6': page.locator(`[data-id="${DURATION_IDS['6']}"][data-object_type="package"]`),
      '12': page.locator(`[data-id="${DURATION_IDS['12']}"][data-object_type="package"]`),
      '24': page.locator(`[data-id="${DURATION_IDS['24']}"][data-object_type="package"]`),
    };
    this.paymentCards = {
      cash: page.locator(`[data-id="${PAYMENT_IDS.cash}"][data-object_type="payment"]`),
      card: page.locator(`[data-id="${PAYMENT_IDS.card}"][data-object_type="payment"]`),
      epay: page.locator(`[data-id="${PAYMENT_IDS.epay}"][data-object_type="payment"]`),
    };
    this.contractCards = {
      prepaid: page.locator('[data-id="N"][data-object_type="contract"]'),
      installment: page.locator('[data-id="Y"][data-object_type="contract"]'),
    };

    this.selectedTime = page.locator('#selected-time');
    this.payFor = page.locator('#pay-for');
    this.payMonthly = page.locator('#pay-monthly');
    this.selectedPayment = page.locator('#selected-payment');

    this.contractFullNameInput = page.locator('#fullname');
    this.contractPhoneInput = page.locator('#phone-number');
    this.contractTermsLabel = page.locator('label[for="customCheck1"]');
    this.contractPrivacyLabel = page.locator('label[for="customCheck2"]');
    this.contractGuardianLabel = page.locator('label[for="customCheck3"]');
    this.contractForwardButton = page.locator('#forward');
    this.contractCodeModal = page.locator('#modal-code-verification');
    this.contractCodeInput = page.locator('#modal-code-verification input[name="code"]');
    this.contractCodeConfirmButton = page.locator('#code-verification-confirm-code-button');

    this.cardNameInput = page.locator('#cardname');
    this.cardNumberInput = page.locator('#cardnr');
    this.expiryMonthSelect = page.locator('#expmonth');
    this.expiryYearSelect = page.locator('#expyear');
    this.cvcInput = page.locator('#cvc2');
    this.payButton = page.getByText('Плащане', { exact: true });
    this.enableRecurringButton = page.getByText('Включете', { exact: true });
    this.saveCardButton = page.getByText('Запазете', { exact: true });
    this.cardUpdateResult = page.locator('#wrap'); // the page's content wrapper — only for toContainText
    this.cardUpdateNextPayment = page.locator('#recurring-table .recurring-next .recurring-td');
    this.cardUpdateType = page.locator('#recurring-table .recurring-type .recurring-td');
    this.cardUpdateLast4 = page.locator('#recurring-table .recurring-mask .recurring-td');

    // Confirmed live: `/pay_final.php` has a real duplicate-id bug — a second, unrelated
    // "possible payment methods" block further down the page reuses the same
    // `id="payment-help-details"`. `.first()` is the one that actually contains the success
    // heading (confirmed by DOM order, not guessed) — a genuine strict-mode violation
    // otherwise.
    this.easyPaySuccessHeading = page.locator('#payment-help-details').first();
    this.easyPayCode = page.locator('.easypay-heading-div .text-jane');

    this.easyPayTerminalCodeInput = page.locator('input[name="idn"]');
    this.easyPayTerminalRetrieveButton = page.locator('input[name="submit_idn"]');
    this.easyPayTerminalPayButton = page.locator('input[name="pay_bill"]');

    this.epayUsernameInput = page.locator('input[name="user"]');
    this.epayPasswordInput = page.locator('input[name="pass"]');
    this.epayLoginSubmitButton = page.locator('input[type="submit"]');
    this.epayConfirmPaymentButton = page.locator('input[name="BUTTON:FORM:PAY_BILLS_CONFIRM"]');
    this.epayContinueLink = page.getByRole('link', { name: 'Продължаване' });
  }

  /**
   * Confirmed live: which payment methods are actually selectable depends on an async call
   * the page fires after its initial HTML is already rendered
   * (`POST /payment/subscription/load-payments`) — a click on a payment-method card that
   * lands before that response comes back is a genuine silent no-op (reproduced directly:
   * instrumented the DOM and watched the epay card's class/label never change at all across
   * 4s of polling after such an early click). Duration/contract selection don't depend on
   * this call and are unaffected, but waiting here covers every caller uniformly and is
   * cheap (the request is already in flight from page load).
   */
  async goto() {
    const loadPayments = this.page.waitForResponse((r) => r.url().includes('/payment/subscription/load-payments'), {
      timeout: 10000,
    });
    await this.page.goto('/subscription/');
    await loadPayments.catch(() => {});
  }

  /** Switches the plan duration. No-op for '12' — already the page's default selection. */
  async selectDuration(duration: Duration) {
    if (duration === '12') return;
    await clickWhenReady(this.durationCards[duration], () =>
      this.page.locator(`[data-id="${DURATION_IDS[duration]}"].selected`).waitFor({ state: 'visible', timeout: 5000 })
    );
  }

  /**
   * Switches the payment method. No-op for 'card' — already the page's default selection.
   *
   * Confirmed live: the clicked card's own `.selected` CSS class is a *purely visual* toggle
   * that lands before the underlying value `#subscribe-button` actually submits is updated —
   * they're not the same event. Waiting only on `.selected` (as duration/contract selection
   * safely can) is provably too early here: reproduced switching to epay, then clicking
   * subscribe immediately, submitting a card/FIBank checkout instead of an epay one. A fixed
   * settle wait (tried 800ms) did not reliably fix it either — the real, reliable readiness
   * signal is `#selected-payment-label`'s text actually updating to the new method, which is
   * what this waits for instead.
   */
  async selectPaymentMethod(method: PaymentMethod) {
    if (method === 'card') return;
    await clickWhenReady(this.paymentCards[method], () =>
      this.page.locator(`[data-id="${PAYMENT_IDS[method]}"].selected`).waitFor({ state: 'visible', timeout: 5000 })
    );
    await this.page
      .locator('#selected-payment-label', { hasText: PAYMENT_LABELS[method] })
      .waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Switches to "Плащане на месец" (installment) instead of the default prepaid contract.
   * Only compatible with card payment and 12/24-month durations — confirmed live that the
   * 6-month package and the cash/ePay payment cards carry a `disabled-for-contract` class
   * once this is selected (with an explanatory tooltip), so callers must select installment
   * before switching duration/payment method, not after.
   */
  async selectInstallment() {
    await clickWhenReady(this.contractCards.installment, () =>
      this.page.locator('#pay-monthly:not(.d-none)').waitFor({ state: 'visible', timeout: 5000 })
    );
  }

  /**
   * Clicks the selected plan through to checkout. The destination depends on the payment
   * method actually selected beforehand (all confirmed live):
   * - `card` + prepaid → FIBank's test checkout page directly.
   * - `card` + installment → `/payment-contract` first (see completeInstallmentContractDetails()).
   * - `cash` (EasyPay) → same-origin `/pay_final.php` order-confirmation page (a pending
   *   order with a payment code, not an active subscription).
   * - `epay` → redirects off-site to ePay's own gateway (`epay.bg` — `demo.epay.bg` on dev).
   * Same click-handler-binds-late race as elsewhere on this site — wrapped in clickWhenReady.
   */
  async proceedToCheckout(method: PaymentMethod = 'card') {
    if (method === 'cash') {
      await clickWhenReady(this.subscribeButton, () =>
        this.page.waitForURL(/\/pay_final\.php/, { timeout: 15000 })
      );
    } else if (method === 'epay') {
      await clickWhenReady(this.subscribeButton, () => this.page.waitForURL(/epay\.bg/, { timeout: 15000 }));
    } else {
      await clickWhenReady(this.subscribeButton, () =>
        Promise.race([
          this.page.waitForURL(/mdpay-test\.fibank\.bg/, { timeout: 15000 }),
          this.page.waitForURL(/\/payment-contract/, { timeout: 15000 }),
        ])
      );
    }
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * Buying again while a subscription runs, with the card saved from the first purchase (verified live
   * 2026-11-02): "Купи" goes to `/payment/payment-card` instead of FIBank's form — it names the card
   * ("завършващ на …") and says the new subscription starts when the current one ends — and
   * "Завършете плащането" pays with it, ending on /payment/final/success.
   */
  async proceedToSavedCardCheckout() {
    await clickWhenReady(this.subscribeButton, () => this.page.waitForURL(/\/payment\/payment-card/, { timeout: 15000 }));
  }

  async paySavedCard() {
    await clickWhenReady(this.page.getByRole('button', { name: 'Завършете плащането' }), () =>
      this.page.waitForURL(/\/payment\/final\/success/, { timeout: 15000 })
    );
  }

  /**
   * Installment only: fills the parent/guardian details `/payment-contract` requires, then
   * confirms the SMS code sent to that phone (a real legal-contract safeguard, not specific
   * to any one feature) — the dev-environment bypass code (111111) applies here too.
   * Resolves once redirected on to FIBank's test checkout page.
   */
  async completeInstallmentContractDetails(details: { parentName: string; parentPhone: string; smsCode: string }) {
    await this.contractFullNameInput.fill(details.parentName);
    await this.contractPhoneInput.fill(details.parentPhone);
    await this.contractTermsLabel.click();
    await this.contractPrivacyLabel.click();
    await this.contractGuardianLabel.click();
    await clickWhenReady(this.contractForwardButton, () =>
      this.contractCodeModal.waitFor({ state: 'visible', timeout: 8000 })
    );
    await this.contractCodeInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.contractCodeInput.fill(details.smsCode);
    await clickWhenReady(this.contractCodeConfirmButton, () =>
      this.page.waitForURL(/mdpay-test\.fibank\.bg/, { timeout: 10000 })
    );
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /** Fills FIBank's card form and pays — resolves once redirected back to the success page. */
  async payWithCard(card: FibankCard) {
    await this.fillCardForm(card);
    await this.payButton.click();
    await this.page.waitForURL(/\/payment\/final\/success/, { timeout: 15000 });
    // FIBank sends a declined payment here too; unless set-data simulated it, the sandbox card is used up.
    if ((await this.page.locator('#wrap').innerText()).includes('Неуспешно завършена поръчка')) noteFibankDecline(card);
  }

  /**
   * FIBank's "Настройки на автоматично подновяване" page (after "Включи" on
   * /profile/subscription/): same card form, but it only holds 0,01 € to check the card and
   * the submit says "Включете". Resolves on /payment/final/success ("Успешна промяна!").
   */
  async enableRecurringWithCard(card: FibankCard) {
    await this.fillCardForm(card);
    await this.enableRecurringButton.click();
    await this.page.waitForURL(/\/payment\/final\/success/, { timeout: 15000 });
  }

  /** FIBank's card-settings page (after "Актуализирай картата си"): fills the new card and saves — resolves on /payment/final/success. */
  async saveNewCard(card: FibankCard) {
    await this.fillCardForm(card);
    await this.saveCardButton.click();
    await this.page.waitForURL(/\/payment\/final\/success/, { timeout: 20000 });
  }

  private async fillCardForm(card: FibankCard) {
    await this.cardNameInput.fill(card.name);
    await this.cardNumberInput.fill(card.number);
    await this.expiryMonthSelect.selectOption(card.expiryMonth);
    await this.expiryYearSelect.selectOption(card.expiryYear);
    await this.cvcInput.fill(card.cvc);
  }

  /**
   * EasyPay only: pass the 10-digit code read from the pending-order page (`easyPayCode`,
   * right after `proceedToCheckout('cash')`) — a caller that needs to check anything else
   * on that page first (e.g. that the order doesn't activate the subscription by itself)
   * should read the code into a variable before navigating anywhere, since this method
   * navigates off our own site to settle the order via EasyPay/B-Pay's own demo
   * bill-payment simulator (there's nothing to preserve by opening a second tab instead,
   * unlike ePay's redirect-based flow below). Confirmed live: `STATUS=OK` comes back
   * immediately and the subscription activates within a few seconds — poll
   * `/profile/subscription/` rather than assuming a fixed delay is enough.
   */
  async completeEasyPayViaDemoTerminal(code: string) {
    await this.page.goto('https://demo.epay.bg/ezp/pay_bill.cgi');
    await this.easyPayTerminalCodeInput.fill(code);
    await this.easyPayTerminalRetrieveButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.easyPayTerminalPayButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * ePay only: from ePay's own login page (right after `proceedToCheckout('epay')`), logs in
   * with the given demo credentials, confirms the pending payment shown there, then follows
   * the gateway's own "Продължаване" link back to our site's `/pay_final.php`. Resolves once
   * back on our own origin — activation itself isn't instant, see waitForActiveSubscription().
   */
  async payWithEpay(credentials: { username: string; password: string }) {
    await this.epayUsernameInput.fill(credentials.username);
    await this.epayPasswordInput.fill(credentials.password);
    await this.epayLoginSubmitButton.click();
    await this.epayConfirmPaymentButton.click();
    await this.epayContinueLink.click();
    await this.page.waitForURL(/\/pay_final\.php/, { timeout: 15000 });
  }

  /**
   * Polls `/profile/subscription/` until the visible status next to "Твоят абонамент е" says
   * "Активен" (or the timeout elapses, in which case it throws). Confirmed live that both the
   * EasyPay-terminal and ePay completions activate the subscription within a few seconds of
   * the gateway confirming payment, but not instantly — a single check right after
   * redirecting back can observe stale (still-inactive) state. The "Активирай абонамент сега"
   * text can sit hidden in the page of an active subscription, so it is not used here.
   * The profile templates (prepaid and monthly plan alike) print "Активен" for a running
   * subscription; "Изтичащ" / "Спрян" are other states and don't count as active.
   */
  async waitForActiveSubscription({ timeoutMs = 20000, pollIntervalMs = 2000 }: { timeoutMs?: number; pollIntervalMs?: number } = {}) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      await this.page.goto('/profile/subscription/');
      if (await this.subscriptionStatus.filter({ hasText: /^\s*Активен\s*$/ }).isVisible()) return;
      await this.page.waitForTimeout(pollIntervalMs);
    }
    throw new Error(`Subscription did not show the status "Активен" within ${timeoutMs}ms`);
  }
}
