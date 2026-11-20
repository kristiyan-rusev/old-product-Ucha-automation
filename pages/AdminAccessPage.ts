import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoginPage } from './LoginPage';
import { clickWhenReady } from '../utils/clickWhenReady';

/**
 * The admin panel and the 2FA step in front of it. The QA admin logs in on the normal /login/;
 * /admin/access-verification then has one button, "Генериране на код за достъп", which opens the
 * same code modal as the other verification steps (the SMS goes to the account's own phone; on dev
 * the fixed code 111111 is accepted). Looking only — nothing inside the panel is touched.
 */
export class AdminAccessPage extends BasePage {
  readonly generateCodeButton: Locator;
  readonly codeModal: Locator;
  readonly codeInput: Locator;
  readonly confirmButton: Locator;
  readonly panelHeading: Locator;

  constructor(page: Page) {
    super(page);

    this.generateCodeButton = page.locator('#generate-code');
    this.codeModal = page.locator('#modal-code-verification');
    this.codeInput = this.codeModal.locator('#code');
    this.confirmButton = this.codeModal.locator('#code-verification-confirm-code-button');
    // Shown in capitals by CSS; the DOM text is "Администрация на Уча.се".
    this.panelHeading = page.getByText('Администрация на Уча.се');
  }

  /** Logs in on /login/ with the QA admin (the normal login; 2FA comes after it). */
  async logIn(email: string, password: string) {
    const login = new LoginPage(this.page);
    await login.goto();
    await login.login(email, password);
  }

  async gotoAccessVerification() {
    await this.page.goto('/admin/access-verification');
  }

  /** "Генериране на код за достъп" → the code modal; fills the code and confirms — ends on the panel. */
  async confirmWithCode(code: string) {
    await clickWhenReady(this.generateCodeButton, () => this.codeModal.waitFor({ state: 'visible', timeout: 10_000 }));
    await this.codeInput.fill(code);
    await clickWhenReady(this.confirmButton, () =>
      this.page.waitForURL((url) => !url.pathname.includes('access-verification'), { timeout: 15_000 })
    );
  }
}
