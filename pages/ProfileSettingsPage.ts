import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { retryClick } from '../utils/retryClick';

export class ProfileSettingsPage extends BasePage {
  // Step 0 — jump to the "Деактивиране на профила" section and trigger the flow.
  // Deep on a long page — clicking via real pixel coordinates avoids a genuine Playwright
  // quirk where this specific button reports "outside of viewport" right after a scroll,
  // despite its own bounding box being well within the visible area.
  readonly deactivateSectionLink: Locator;
  readonly deactivateTriggerButton: Locator;

  // Step 1 — SMS verification (#modal-code-verification). The trigger button's click starts
  // the process and shows this modal with a "Изпрати код" button; only clicking that actually
  // sends the code and reveals the code-input field.
  readonly codeVerificationModal: Locator;
  readonly sendCodeButton: Locator;
  readonly codeInput: Locator;
  readonly confirmCodeButton: Locator;

  // Step 2 — "why are you leaving" reason poll (#modal-delete-form).
  readonly reasonPollModal: Locator;
  readonly pollNextButton: Locator;

  // Step 3 — password re-confirmation (#modal-delete-confirm).
  readonly deleteConfirmModal: Locator;
  readonly confirmPasswordInput: Locator;
  readonly finalDeactivateButton: Locator;

  constructor(page: Page) {
    super(page);

    this.deactivateSectionLink = page.locator('a[href="#delete"]');
    this.deactivateTriggerButton = page.locator('#delete >> #delete-profile-button');

    this.codeVerificationModal = page.locator('#modal-code-verification');
    this.sendCodeButton = page.locator('#code-verification-send-code-button');
    this.codeInput = page.locator('#modal-code-verification input[name="code"]');
    this.confirmCodeButton = page.locator('#code-verification-confirm-code-button');

    this.reasonPollModal = page.locator('#modal-delete-form');
    this.pollNextButton = page.locator('#poll-form-button');

    this.deleteConfirmModal = page.locator('#modal-delete-confirm');
    this.confirmPasswordInput = page.locator('#form-delete-confirm input[name="password"]');
    this.finalDeactivateButton = page.locator('#form-delete-confirm #delete-profile-button');
  }

  async goto() {
    await this.page.goto('/profile/settings/');
  }

  /** Reason radios are Bootstrap custom-radios — the input itself is visually hidden behind its label. */
  reasonLabel(reasonNumber: 1 | 2 | 3 | 4 | 5): Locator {
    return this.page.locator(`label[for="reason${reasonNumber}"]`);
  }

  /** Jumps to the deactivation section and clicks the trigger, opening the SMS verification modal. */
  async startDeactivation() {
    await this.deactivateSectionLink.click();
    await this.page.waitForTimeout(1500); // let the anchor-jump smooth-scroll settle
    await this.deactivateTriggerButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    const box = await this.deactivateTriggerButton.boundingBox();
    if (!box) throw new Error('deactivateTriggerButton has no bounding box');
    await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await this.codeVerificationModal.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Clicks "Изпрати код" and enters the verification code (111111 is the dev-environment
   * bypass, accepted regardless of the account's real phone number).
   */
  async verifyWithCode(code: string) {
    await retryClick(this.sendCodeButton, () => this.codeInput.waitFor({ state: 'visible', timeout: 5000 }));
    await this.codeInput.fill(code);
    await retryClick(this.confirmCodeButton, () =>
      this.reasonPollModal.waitFor({ state: 'visible', timeout: 5000 })
    );
  }

  /** Picks a reason (1-4 need no further input; 5/"Друго" requires filling other_reason too) and advances. */
  async submitReason(reasonNumber: 1 | 2 | 3 | 4) {
    await this.reasonLabel(reasonNumber).click();
    await retryClick(this.pollNextButton, () =>
      this.deleteConfirmModal.waitFor({ state: 'visible', timeout: 5000 })
    );
  }

  /** Re-enters the password and submits, completing the deactivation. */
  async confirmDeactivation(password: string) {
    await this.confirmPasswordInput.fill(password);
    await retryClick(this.finalDeactivateButton, () =>
      this.page.waitForURL((url) => url.pathname.startsWith('/login'), { timeout: 5000 })
    );
  }
}
