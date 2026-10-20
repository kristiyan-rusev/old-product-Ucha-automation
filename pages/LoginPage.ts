import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { clickWhenReady } from '../utils/clickWhenReady';

export class LoginPage extends BasePage {
  readonly form: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorMessage: Locator;
  readonly facebookButton: Locator;
  readonly appleButton: Locator;
  readonly registerLinkFooter: Locator;

  constructor(page: Page) {
    super(page);

    this.form = page.locator('#login-form');
    this.emailInput = page.locator('#login-form input[name="email"]');
    this.passwordInput = page.locator('#login-form input[name="password"]');
    // Login is submitted via a click handler, not a real form submit — this is `type="button"`, not `type="submit"`.
    this.submitButton = page.locator('#send_data');
    this.forgotPasswordLink = page.locator('#link-to-reset-password');
    // Injected server-side into the form on a failed attempt: <span class="error-message-line ...">
    this.errorMessage = page.locator('.error-message-line');
    this.facebookButton = page.locator('#fb-auth');
    this.appleButton = page.locator('#apple-auth');
    this.registerLinkFooter = page.locator('#link-to-register');
  }

  async goto() {
    await this.page.goto('/login/');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submit();
  }

  /**
   * #send_data's click handler is bound after the page's JS bundle finishes loading —
   * clicking before that is a silent no-op, so retry until either outcome is observed.
   */
  async submit() {
    await clickWhenReady(this.submitButton, () =>
      Promise.race([
        this.page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 5000 }),
        this.errorMessage.waitFor({ state: 'visible', timeout: 5000 }),
      ])
    );
  }
}
