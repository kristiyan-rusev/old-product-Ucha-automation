import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { retryClick } from '../utils/retryClick';

export class ResetPasswordPage extends BasePage {
  // Request step (/reset-password/) — #password-forgotten
  readonly requestForm: Locator;
  readonly emailInput: Locator;
  readonly requestSubmitButton: Locator;
  readonly requestSuccessMessage: Locator;

  // Set-new-password step (/reset-password/new/{token}) — note the site's own form id has
  // a Cyrillic "о" in "passwоrd" (a typo in their markup) so this targets by name instead.
  readonly newPasswordInput: Locator;
  readonly newPasswordSubmitButton: Locator;

  constructor(page: Page) {
    super(page);

    this.requestForm = page.locator('#password-forgotten');
    this.emailInput = page.locator('#password-forgotten input[name="email"]');
    this.requestSubmitButton = page.locator('#password-forgotten #send_data');
    this.requestSuccessMessage = page.locator('#reset-password-success');

    this.newPasswordInput = page.locator('input[name="new-password"]');
    this.newPasswordSubmitButton = page.locator('#send_new_password');
  }

  async goto() {
    await this.page.goto('/reset-password/');
  }

  /**
   * Submits the "forgot password" request. Same JS-init click-handler race as login and
   * registration, so this retries until either the success message appears or the
   * server rejects it.
   */
  async requestReset(email: string) {
    await this.emailInput.fill(email);
    await retryClick(this.requestSubmitButton, () =>
      this.requestSuccessMessage.waitFor({ state: 'visible', timeout: 5000 })
    );
  }

  /** On the /reset-password/new/{token} page: sets the new password and waits for the redirect to /login/. */
  async setNewPassword(newPassword: string) {
    await this.newPasswordInput.fill(newPassword);
    await retryClick(this.newPasswordSubmitButton, () =>
      this.page.waitForURL((url) => url.pathname.startsWith('/login'), { timeout: 5000 })
    );
  }
}
