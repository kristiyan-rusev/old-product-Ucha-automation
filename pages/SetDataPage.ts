import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * /set-data.php — dev-only QA tools, scoped to the logged-in user (UCHAdocumentation §11).
 *
 * FIBank simulation ("Избери резултат за всички плащания"), `select[name="fail_reason"]`
 * (verified live 2026-10-07): 0 = нормални, 101 = изтекла карта, 116 = недостатъчна
 * наличност, 1000 = неизвестна причина, 110 = грешна сума, 160 = Отказ, 3DS.
 *
 * WARNING: every reason except "изтекла карта" applies to ALL payments on the whole dev site
 * (every user) until switched back — only use EXPIRED_CARD in automated tests (agreed with
 * the user 2026-10-07), and always reset to NORMAL in a finally block.
 */
export const FailReason = { NORMAL: '0', EXPIRED_CARD: '101' } as const;

export class SetDataPage extends BasePage {
  readonly failReasonSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.failReasonSelect = page.locator('select[name="fail_reason"]');
  }

  async goto() {
    await this.page.goto('/set-data.php');
  }

  async setFibankResult(reason: (typeof FailReason)[keyof typeof FailReason]) {
    await this.goto();
    const form = this.page.locator('form').filter({ has: this.failReasonSelect });
    await this.failReasonSelect.selectOption(reason);
    await Promise.all([this.page.waitForLoadState('load'), form.locator('button[type="submit"]').click()]);
    await this.page.waitForFunction((r) => (document.querySelector('select[name="fail_reason"]') as HTMLSelectElement)?.value === r, reason);
  }
}
