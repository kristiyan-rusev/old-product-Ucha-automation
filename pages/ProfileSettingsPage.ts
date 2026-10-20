import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { clickWhenReady } from '../utils/clickWhenReady';

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

  // "Лични данни" (personal data) section (#personal_data). Saving ANY change here — even
  // without touching phone — triggers phone re-verification via codeVerificationModal, but
  // a different variant than deactivation's: the code is sent automatically (no "Изпрати
  // код" button), so confirming it only needs confirmSentCode(), not verifyWithCode().
  readonly personalDataEditButton: Locator;
  readonly personalDataSaveButton: Locator;
  readonly personalDataCancelButton: Locator;
  readonly nameInput: Locator;
  readonly genderMaleLabel: Locator;
  readonly genderFemaleLabel: Locator;
  readonly personalDataPhoneInput: Locator;
  readonly personalDataPreview: Locator;

  // "Училище и клас" (school & grade) section (#additional_data). Unlike personal_data,
  // saving here is a plain AJAX POST with no phone re-verification.
  readonly schoolClassEditButton: Locator;
  readonly schoolClassSaveButton: Locator;
  readonly schoolClassCancelButton: Locator;
  readonly schoolClassCitySelect: Locator;
  readonly schoolClassSchoolSelect: Locator;
  readonly schoolClassGradeSelect: Locator;
  readonly schoolClassPreview: Locator;

  // "Имейл за вход в Уча.се" (login email) section (#login_email) — the longest of these
  // flows: save -> an intermediate "before we continue, we'll text your phone" prompt
  // (#modal-send-code) -> a THIRD distinct SMS-code modal variant (#modal-confirm-code, not
  // codeVerificationModal) -> then an email to the *new* address whose link must be visited
  // to finalize the change, which also logs the user out (see
  // utils/fetchConfirmationLink.ts's fetchEmailChangeConfirmationLink).
  readonly loginEmailEditButton: Locator;
  readonly loginEmailSaveButton: Locator;
  readonly newEmailInput: Locator;
  readonly loginEmailPasswordInput: Locator;
  readonly loginEmailPreview: Locator;
  readonly sendCodePromptModal: Locator;
  readonly sendCodePromptButton: Locator;
  readonly emailChangeCodeModal: Locator;
  readonly emailChangeCodeInput: Locator;
  readonly emailChangeCodeConfirmButton: Locator;

  // "Парола за вход в Уча.се" (password) section (#login_details). Like school & grade,
  // saves directly — no phone/email re-verification.
  readonly loginDetailsEditButton: Locator;
  readonly loginDetailsSaveButton: Locator;
  readonly oldPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly newPasswordConfirmInput: Locator;

  // "Известия" (notifications) section (#newsletter). Two live toggles (comment-reply email
  // notifications, marketing emails) — a third, "profile report to parent", is permanently
  // disabled without a paid subscription, so not covered. Saves directly, no
  // re-verification. Each checkbox is visually hidden behind toggle-switch styling — click
  // the wrapping label, same as this site's other custom-styled checkboxes/radios.
  readonly newsletterEditButton: Locator;
  readonly newsletterSaveButton: Locator;
  readonly commentReplyToggleCheckbox: Locator;
  readonly commentReplyToggleLabel: Locator;
  readonly marketingEmailsToggleLabel: Locator;
  readonly newsletterPreview: Locator;

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

    this.personalDataEditButton = page.locator('#personal_data button.profile-section-edit[data-profile_mode="form"]');
    this.personalDataSaveButton = page.locator('#personal_data button.profile-section-save');
    this.personalDataCancelButton = page.locator('#personal_data button[data-profile_mode="preview"]');
    this.nameInput = page.locator('#personal_data input[name="username"]');
    this.genderMaleLabel = page.locator('label[for="profile-male"]');
    this.genderFemaleLabel = page.locator('label[for="profile-female"]');
    this.personalDataPhoneInput = page.locator('#personal_data #phone-number-value');
    this.personalDataPreview = page.locator('#personal_data');

    this.schoolClassEditButton = page.locator('#additional_data button.profile-section-edit[data-profile_mode="form"]');
    this.schoolClassSaveButton = page.locator('#additional_data button.profile-section-save');
    this.schoolClassCancelButton = page.locator('#additional_data button[data-profile_mode="preview"]');
    this.schoolClassCitySelect = page.locator('#additional_data #city');
    this.schoolClassSchoolSelect = page.locator('#additional_data #school-filter');
    this.schoolClassGradeSelect = page.locator('#additional_data select[name="grade"]');
    this.schoolClassPreview = page.locator('#additional_data');

    this.loginEmailEditButton = page.locator('#login_email button.profile-section-edit[data-profile_mode="form"]');
    this.loginEmailSaveButton = page.locator('#login_email button.profile-section-save');
    this.newEmailInput = page.locator('#login_email input[name="new_email"]');
    this.loginEmailPasswordInput = page.locator('#login_email input[name="password"]');
    this.loginEmailPreview = page.locator('#login_email');
    this.sendCodePromptModal = page.locator('#modal-send-code');
    this.sendCodePromptButton = page.locator('#modal-send-code #send-code-button');
    this.emailChangeCodeModal = page.locator('#modal-confirm-code');
    this.emailChangeCodeInput = page.locator('#modal-confirm-code input[name="code"]');
    this.emailChangeCodeConfirmButton = page.locator('#modal-confirm-code #confirm-code-button');

    this.loginDetailsEditButton = page.locator('#login_details button.profile-section-edit[data-profile_mode="form"]');
    this.loginDetailsSaveButton = page.locator('#login_details button.profile-section-save');
    this.oldPasswordInput = page.locator('#login_details input[name="old_password"]');
    this.newPasswordInput = page.locator('#login_details input[name="new_password_1"]');
    this.newPasswordConfirmInput = page.locator('#login_details input[name="new_password_2"]');

    this.newsletterEditButton = page.locator('#newsletter button.profile-section-edit[data-profile_mode="form"]');
    this.newsletterSaveButton = page.locator('#newsletter button.profile-section-save');
    this.commentReplyToggleCheckbox = page.locator('#custom-check-all');
    this.commentReplyToggleLabel = page.locator('label.switch', { has: this.commentReplyToggleCheckbox });
    this.marketingEmailsToggleLabel = page.locator('label[for="custom-check-marketing-emails"]');
    this.newsletterPreview = page.locator('#newsletter');
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
    await clickWhenReady(this.sendCodeButton, () => this.codeInput.waitFor({ state: 'visible', timeout: 5000 }));
    await this.codeInput.fill(code);
    await clickWhenReady(this.confirmCodeButton, () =>
      this.reasonPollModal.waitFor({ state: 'visible', timeout: 5000 })
    );
  }

  /** Picks a reason (1-4 need no further input; 5/"Друго" requires filling other_reason too) and advances. */
  async submitReason(reasonNumber: 1 | 2 | 3 | 4) {
    await this.reasonLabel(reasonNumber).click();
    await clickWhenReady(this.pollNextButton, () =>
      this.deleteConfirmModal.waitFor({ state: 'visible', timeout: 5000 })
    );
  }

  /** Re-enters the password and submits, completing the deactivation. */
  async confirmDeactivation(password: string) {
    await this.confirmPasswordInput.fill(password);
    await clickWhenReady(this.finalDeactivateButton, () =>
      this.page.waitForURL((url) => url.pathname.startsWith('/login'), { timeout: 5000 })
    );
  }

  /** Switches the "Лични данни" section from preview to its editable form. */
  async openPersonalDataEdit() {
    await clickWhenReady(this.personalDataEditButton, () => this.nameInput.waitFor({ state: 'visible', timeout: 5000 }));
  }

  /**
   * Clicks "Запази промените" — this always opens codeVerificationModal for phone
   * re-verification, regardless of which field(s) actually changed (confirmed live: even a
   * name/gender-only edit triggers it).
   */
  async savePersonalData() {
    await clickWhenReady(this.personalDataSaveButton, () =>
      this.codeVerificationModal.waitFor({ state: 'visible', timeout: 8000 })
    );
  }

  /**
   * Confirms codeVerificationModal when the code was already sent automatically (no
   * separate "Изпрати код" step needed first) — unlike verifyWithCode(), used by
   * deactivation, where sending the code is a distinct button click.
   */
  async confirmSentCode(code: string) {
    await this.codeInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.codeInput.fill(code);
    await clickWhenReady(this.confirmCodeButton, () =>
      this.codeVerificationModal.waitFor({ state: 'hidden', timeout: 5000 })
    );
  }

  /** Switches the "Училище и клас" section from preview to its editable form. */
  async openSchoolClassEdit() {
    await clickWhenReady(this.schoolClassEditButton, () =>
      this.schoolClassGradeSelect.waitFor({ state: 'visible', timeout: 5000 })
    );
  }

  /** Saves the school/grade section — a plain AJAX POST, no phone re-verification unlike personal data. */
  async saveSchoolClass() {
    await clickWhenReady(this.schoolClassSaveButton, () =>
      this.schoolClassEditButton.waitFor({ state: 'visible', timeout: 5000 })
    );
  }

  /** Switches the "Имейл за вход в Уча.се" section from preview to its editable form. */
  async openLoginEmailEdit() {
    await clickWhenReady(this.loginEmailEditButton, () => this.newEmailInput.waitFor({ state: 'visible', timeout: 5000 }));
  }

  /** Fills the new email + current password and submits, opening the "before we continue" phone prompt. */
  async submitNewLoginEmail(newEmail: string, password: string) {
    await this.newEmailInput.fill(newEmail);
    await this.loginEmailPasswordInput.fill(password);
    await clickWhenReady(this.loginEmailSaveButton, () =>
      this.sendCodePromptModal.waitFor({ state: 'visible', timeout: 8000 })
    );
  }

  /** Confirms sending the SMS code from the "before we continue" prompt, revealing the code input. */
  async confirmSendCodePrompt() {
    await clickWhenReady(this.sendCodePromptButton, () =>
      this.emailChangeCodeModal.waitFor({ state: 'visible', timeout: 8000 })
    );
  }

  /**
   * Enters and confirms the SMS code for the email-change flow — a third distinct modal
   * variant (#modal-confirm-code), separate from both deactivation's and personal data's.
   * This only authorizes the change; the real switch happens when the confirmation link
   * emailed to the *new* address (fetchEmailChangeConfirmationLink) is visited.
   */
  async confirmEmailChangeCode(code: string) {
    await this.emailChangeCodeInput.fill(code);
    await clickWhenReady(this.emailChangeCodeConfirmButton, () =>
      this.emailChangeCodeModal.waitFor({ state: 'hidden', timeout: 5000 })
    );
  }

  /** Switches the "Парола за вход в Уча.се" section from preview to its editable form. */
  async openLoginDetailsEdit() {
    await clickWhenReady(this.loginDetailsEditButton, () =>
      this.oldPasswordInput.waitFor({ state: 'visible', timeout: 5000 })
    );
  }

  /** Fills and saves a new password — a plain AJAX POST, no re-verification unlike email/personal data. */
  async changePassword(oldPassword: string, newPassword: string) {
    await this.oldPasswordInput.fill(oldPassword);
    await this.newPasswordInput.fill(newPassword);
    await this.newPasswordConfirmInput.fill(newPassword);
    await clickWhenReady(this.loginDetailsSaveButton, () =>
      this.loginDetailsEditButton.waitFor({ state: 'visible', timeout: 5000 })
    );
  }

  /** Switches the "Известия" section from preview to its editable form. */
  async openNewsletterEdit() {
    await clickWhenReady(this.newsletterEditButton, () =>
      this.commentReplyToggleLabel.waitFor({ state: 'visible', timeout: 5000 })
    );
  }

  /** Saves whatever toggle state is currently set — a plain AJAX POST, no re-verification. */
  async saveNewsletter() {
    await clickWhenReady(this.newsletterSaveButton, () =>
      this.newsletterEditButton.waitFor({ state: 'visible', timeout: 5000 })
    );
  }
}
