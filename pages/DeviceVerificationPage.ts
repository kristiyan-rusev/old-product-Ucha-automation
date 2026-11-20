import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoginPage } from './LoginPage';
import { clickWhenReady } from '../utils/clickWhenReady';

/**
 * /login/device-verification — shown instead of the dashboard when an account WITH a subscription
 * logs in from a browser the site doesn't know. "Продължи" sends a 6-digit code by email; on dev
 * the bypass code 111111 is accepted. (Ids are the ones utils/accounts.ts already relies on.)
 */
export class DeviceVerificationPage extends BasePage {
  readonly continueButton: Locator;
  readonly codeInput: Locator;
  readonly confirmButton: Locator;
  readonly replaceDeviceButtons: Locator;
  readonly confirmExchangeButton: Locator;

  constructor(page: Page) {
    super(page);

    this.continueButton = page.locator('#continue-verification');
    this.codeInput = page.locator('#code');
    this.confirmButton = page.locator('#code-verification-confirm-code-button');
    this.replaceDeviceButtons = page.locator('.single-device .edit-device-icon');
    this.confirmExchangeButton = page.locator('#confirm-exchange');
  }

  /** Logs in from /login/ and waits for the device-verification step (not for the dashboard). */
  async logInFromNewDevice(email: string, password: string) {
    const login = new LoginPage(this.page);
    await login.goto();
    await login.emailInput.fill(email);
    await login.passwordInput.fill(password);
    await clickWhenReady(login.submitButton, () =>
      this.page.waitForURL(/\/login\/device-verification/, { timeout: 15_000 })
    );
  }

  /**
   * "Продължи" → the code field appears; fills the code and confirms. An account that already has three devices
   * (a permanent account, after many runs) is then asked which one to replace ("Замени"): the first is replaced.
   */
  async confirmWithCode(code: string) {
    const leftLogin = () => this.page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15_000 });
    await clickWhenReady(this.continueButton, () => this.codeInput.waitFor({ state: 'visible', timeout: 10_000 }));
    await this.codeInput.fill(code);
    await clickWhenReady(this.confirmButton, () => Promise.race([leftLogin(), this.replaceDeviceButtons.first().waitFor({ state: 'visible', timeout: 15_000 })]));
    if (await this.replaceDeviceButtons.first().isVisible()) {
      // First device in the list — which one doesn't matter for the test; the page then asks to confirm.
      await clickWhenReady(this.replaceDeviceButtons.first(), () => this.confirmExchangeButton.waitFor({ state: 'visible', timeout: 10_000 }));
      await clickWhenReady(this.confirmExchangeButton, leftLogin);
    }
  }
}
