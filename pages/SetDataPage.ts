import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { setFibankFailureSimulated } from '../utils/fibankCards';

/**
 * /set-data.php — dev-only QA tools, scoped to the logged-in user (UCHAdocumentation §11).
 *
 * FIBank simulation ("Избери резултат за всички плащания"), `select[name="fail_reason"]`
 * (verified live 2026-10-07): 0 = нормални, 101 = изтекла карта, 116 = недостатъчна
 * наличност, 1000 = неизвестна причина, 110 = грешна сума, 160 = Отказ, 3DS.
 *
 * The reason is stored per account and applies to payments made while that account is logged in —
 * but a cron job opened in its browser applies it to every automatic charge in that request, other
 * accounts' too (source: SimulateFailPayment, PaymentModel; automation/SET_DATA.md). Only use
 * EXPIRED_CARD in automated tests (agreed with the user 2026-10-07), and always reset to NORMAL in
 * a finally block.
 */
export const FailReason = { NORMAL: '0', EXPIRED_CARD: '101' } as const;

export class SetDataPage extends BasePage {
  readonly failReasonSelect: Locator;
  readonly resetPaymentDataForm: Locator;
  readonly noSubscriptionNote: Locator;
  readonly noMonthlyPlanNote: Locator;

  constructor(page: Page) {
    super(page);
    this.failReasonSelect = page.locator('select[name="fail_reason"]');
    // "Симулация на начално състояние на потребителя след регистрация (относно абонамент)" —
    // posts only reset_user_payment_data=1, so it applies to the logged-in user alone.
    this.resetPaymentDataForm = page.locator('form').filter({ has: page.locator('input[name="reset_user_payment_data"]') });
    // Set-data's notes in place of the subscriptions table / the monthly-plan block (no id or data-qa).
    this.noSubscriptionNote = page.getByText('Няма текущ абонамент', { exact: true });
    this.noMonthlyPlanNote = page.getByText('Няма текущ абонамент на вноски.', { exact: true });
  }

  /**
   * Puts the logged-in account back to its just-registered state as far as subscriptions go —
   * active plans (monthly-payment ones too) are cleared. The site doesn't let an account that
   * pays monthly be deactivated, so cleanup resets it first.
   */
  async resetPaymentData() {
    await this.goto();
    await this.submit(this.resetPaymentDataForm);
  }

  /**
   * The permanent-account reset (utils/permanentAccount.ts) in as few page loads as possible — normally two: open
   * set-data and submit "Симулирай". The page that comes back is set-data itself, and set-data.php prints the FIBank
   * select and the subscriptions table only after it has run the reset, so both are read from that page. The FIBank
   * form is submitted only when the simulation isn't "нормални" already (a killed run can leave "изтекла карта" on;
   * the reset doesn't clear it). Returns the subscriptions table as it stands after the reset.
   */
  async resetToJustRegistered(): Promise<string[][]> {
    await this.resetPaymentData();
    if ((await this.failReasonSelect.inputValue()) !== FailReason.NORMAL) await this.submitFibankResult(FailReason.NORMAL);
    setFibankFailureSimulated(false);
    return this.readSubscriptionGroups();
  }

  /**
   * Submits one of set-data's forms and waits for the page it answers with. Waits for the new page's `load` event:
   * `waitForLoadState('load')` would be satisfied at once by the page the form is still on.
   */
  private async submit(form: Locator) {
    await Promise.all([this.page.waitForEvent('load'), form.locator('button[type="submit"]').click()]);
  }

  async goto() {
    await this.page.goto('/set-data.php');
    // set-data sends a visitor who isn't logged in to the home page — fail right away, not at the first form.
    if (!new URL(this.page.url()).pathname.startsWith('/set-data.php')) {
      throw new Error(`set-data.php needs a logged-in account — it redirected to ${this.page.url()}`);
    }
  }

  /**
   * "Промяна на дни активност" (prepaid subscription only): positive = days left, negative = days since
   * it expired. Once the subscription has expired the form is gone, so that is the last change.
   */
  async setActiveDays(days: number) {
    await this.goto();
    const form = this.page.locator('form').filter({ has: this.page.locator('input[name="active-days"]') });
    await form.locator('input[name="active-days"]').fill(String(days));
    await Promise.all([this.page.waitForLoadState('load'), form.locator('button[type="submit"]').click()]);
  }

  /**
   * "Симулиране на данни за изпращане на имейли за изтичащ/изтекъл абонамент", with "Изпълни услугата за
   * изпращане" ticked: moves this account's subscription to that state and sends its expiry email right away
   * (the site runs expire_subscription_mails.php for this user only). The emails only go out with auto-renewal off.
   */
  async sendExpiryEmail(kind: 'expires-in-7-days' | 'expired') {
    await this.goto();
    const form = this.page.locator('form').filter({ has: this.page.locator('select[name="expire_subscription_mail"]') });
    await form.locator('select[name="expire_subscription_mail"]').selectOption(kind === 'expired' ? 'expired_subscription' : 'expiring_subscription_7days');
    await form.locator('input[name="cronjob_service"]').check();
    await Promise.all([this.page.waitForLoadState('load'), form.locator('button[type="submit"]').click()]);
  }

  /**
   * Read-only "Текущи и предстоящи абонаменти" table: one entry per subscription (type, from, to, days left,
   * status, extra info — the cell texts in that order) plus the "Общо" row last.
   */
  async subscriptionGroups(): Promise<string[][]> {
    await this.goto();
    return this.readSubscriptionGroups();
  }

  /** `subscriptionGroups()` from the set-data page that is already open. */
  private async readSubscriptionGroups(): Promise<string[][]> {
    // set-data has no ids or data-qa; its blocks are Bootstrap 2 `.span12` columns, pinned here by their heading.
    const table = this.page
      .locator('.span12')
      .filter({ has: this.page.getByRole('heading', { name: 'Текущи и предстоящи абонаменти' }) })
      .locator('tbody tr');
    const rows = await table.all();
    return Promise.all(rows.map(async (row) => (await row.locator('td').allInnerTexts()).map((t) => t.trim())));
  }

  /**
   * "Промяна на данни за текущ абонамент на вноски" (monthly plan only): sets the overdue days (more than 4 →
   * the contract is "Спрян", 0 → "Активен"), the installments left ("Общо оставащи вноски" — set-data's own hint: for testing the
   * last installment) and/or makes the next payment date today. Empty fields are left alone.
   */
  async changeMonthlyContract({ overdueDays, installmentsLeft, nextPaymentToday }: { overdueDays?: number; installmentsLeft?: number; nextPaymentToday?: boolean }) {
    await this.goto();
    const form = this.page.locator('form').filter({ has: this.page.locator('input[name="payment_contract_overdue_days"]') });
    if (overdueDays !== undefined) await form.locator('input[name="payment_contract_overdue_days"]').fill(String(overdueDays));
    if (installmentsLeft !== undefined) await form.locator('input[name="payment_contract_payments_count"]').fill(String(installmentsLeft));
    if (nextPaymentToday) await form.locator('input[name="payment_contract_today_date_process"]').check();
    await Promise.all([this.page.waitForLoadState('load'), form.locator('button[type="submit"]').click()]);
  }

  /**
   * "Промяна на оставащи дни по текущ абонамент на вноски" (monthly plan only): moves the plan's end date — and the account's
   * subscription end — to today + `days`; 0 or less = the plan runs out. Despite set-data's own help text it also moves
   * the plan's next payment dates by the same number of days when no installment is overdue or failed (checked live
   * 2026-11-06; source: PaymentSubscriptionModel::moveDatesOfContract); overdue days stay.
   * Fewer days than before also finishes every dev monthly plan already past its end date, other accounts' too
   * (`PaymentContractModel::processEndedContracts`, automation/SET_DATA.md) — only for items the user OK'd that for.
   */
  async setMonthlyDaysLeft(days: number) {
    await this.goto();
    const form = this.page.locator('form').filter({ has: this.page.locator('input[name="payment_contract_change_days"]') });
    await form.locator('input[name="payment_contract_days"]').fill(String(days));
    await Promise.all([this.page.waitForLoadState('load'), form.locator('button[type="submit"]').click()]);
  }

  /**
   * Read-only "Плащане по абонамент на вноски" block: this account's monthly contract (verified live 2026-11-02;
   * the dates are "dd.mm.yyyy, hh:mm:ss" as the page prints them).
   */
  async monthlyContract() {
    await this.goto();
    // No id or data-qa on the block; it is the info box pinned by its "ID на договор" line.
    const text = await this.page.locator('.alert.alert-info').filter({ hasText: 'ID на договор' }).innerText();
    const field = (label: string) => text.match(new RegExp(`${label}:[ \\t]*(.*)`))?.[1].trim() ?? '';
    return {
      id: field('ID на договор'),
      status: field('Статус'),
      installmentsLeft: Number(field('Общо оставащи вноски')),
      nextPaymentDate: field('Дата на следващо плащане'),
      overdueDays: Number(field('Просрочени дни')),
    };
  }

  /**
   * The user's procedure (2026-10-29): charges the due installment of ONE contract with the saved card by opening
   * `/cronjobs/payments_monthly_subscription.php?ids=<contract id>`. Never without `ids` — without it the job
   * charges every monthly plan on dev. Returns what the page printed.
   */
  async chargeMonthlyInstallment(contractId: string) {
    if (!/^\d+$/.test(contractId)) throw new Error(`Not a contract id: "${contractId}" — the job must never run without ids`);
    await this.page.goto(`/cronjobs/payments_monthly_subscription.php?ids=${contractId}`);
    return (await this.page.locator('body').innerText()).trim();
  }

  /**
   * "Streak discount" form, its discount select: gives this account that streak discount (the options are
   * "Без отстъпка" and "N процента"; values 0–3 as the form posts them). Other fields of the form are left as they are.
   */
  async setStreakDiscount(percent: 'none' | '5' | '10' | '15') {
    await this.goto();
    const select = this.page.locator('select[name="selected_discount"]');
    const form = this.page.locator('form').filter({ has: select });
    await select.selectOption({ none: '0', '5': '1', '10': '2', '15': '3' }[percent]);
    await Promise.all([this.page.waitForLoadState('load'), form.locator('button[type="submit"]').click()]);
  }

  /**
   * Read-only "Рекъринг" block (only with auto-renewal on; verified live 2026-11-02): the package, its length in days,
   * how many automatic payments there were and the type of the last payment ("от потребител" after a purchase,
   * "автоматично" after a renewal by the job).
   */
  async recurringInfo() {
    await this.goto();
    // No id or data-qa; the block is pinned by its "Рекъринг" heading.
    const text = await this.page
      .locator('.span12')
      .filter({ has: this.page.getByRole('heading', { name: 'Рекъринг', exact: true }) })
      .innerText();
    const field = (label: string) => text.match(new RegExp(`${label}:\\s*([^\\n]*)`))?.[1].trim().replace(/,$/, '') ?? '';
    return {
      package: field('Пакет'),
      lengthDays: Number(field('Продължителност').replace(/\D/g, '')),
      automaticPayments: Number(field('Брой поредни автоматични плащания')),
      lastPaymentType: field('Тип на последното плащане'),
    };
  }

  private recurringSimulatedDays?: number;

  /**
   * "Симулиране на изтичащ рекъринг": sets how many days are left until this account's auto-renewal (it backdates the
   * last payment; the subscription's own end date doesn't change).
   */
  async simulateExpiringRecurring(daysLeft: number) {
    await this.goto();
    const form = this.page.locator('form').filter({ has: this.page.locator('input[name="recurring_days_before"]') });
    await form.locator('input[name="recurring_days_before"]').fill(String(daysLeft));
    await Promise.all([this.page.waitForLoadState('load'), form.locator('button[type="submit"]').click()]);
    this.recurringSimulatedDays = daysLeft;
  }

  /**
   * The user's procedure (2026-10-29): opens `/cronjobs/recurring_payments.php`, which renews every subscription whose
   * auto-renewal is due (this account's too — it has no account limit). Only allowed right after
   * `simulateExpiringRecurring(7)`; returns what the page printed.
   */
  async runRecurringRenewalJob() {
    if (this.recurringSimulatedDays !== 7) throw new Error('The renewal job may only run right after "Симулиране на изтичащ рекъринг" = 7 days');
    this.recurringSimulatedDays = undefined;
    await this.page.goto('/cronjobs/recurring_payments.php');
    return (await this.page.locator('body').innerText()).trim();
  }

  async setFibankResult(reason: (typeof FailReason)[keyof typeof FailReason]) {
    await this.goto();
    await this.submitFibankResult(reason);
    setFibankFailureSimulated(reason !== FailReason.NORMAL);
  }

  /** `setFibankResult()` on the set-data page that is already open. */
  private async submitFibankResult(reason: (typeof FailReason)[keyof typeof FailReason]) {
    const form = this.page.locator('form').filter({ has: this.failReasonSelect });
    await this.failReasonSelect.selectOption(reason);
    await this.submit(form);
    // The page set-data answers with prints the stored reason (on the old page the select showed it already).
    await this.page.waitForFunction((r) => (document.querySelector('select[name="fail_reason"]') as HTMLSelectElement)?.value === r, reason);
  }
}
