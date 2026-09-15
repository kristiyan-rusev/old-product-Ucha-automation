import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { retryClick } from '../utils/retryClick';

export type UserKind = 'student' | 'parent' | 'teacher' | 'bulgarian' | 'other';

export class RegistrationPage extends BasePage {
  // Step 1 — "Аз съм:" user kind selection
  readonly registrationContent: Locator;
  readonly studentOption: Locator;
  readonly parentOption: Locator;
  readonly teacherOption: Locator;
  readonly bulgarianAbroadOption: Locator;
  readonly otherOption: Locator;

  // Intermediate step — choose email or Facebook signup for the selected kind
  readonly registerWithEmailButton: Locator;
  readonly registerWithFacebookButton: Locator;
  readonly backToKindButton: Locator;

  // Registration form (#register) — revealed after choosing "email"
  readonly form: Locator;
  readonly usernameInput: Locator;
  readonly phoneNumberInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly password2Input: Locator;
  readonly marketingEmailsCheckbox: Locator;
  readonly termsCheckbox: Locator;
  readonly gradeSelect: Locator;
  readonly citySelect: Locator;
  readonly schoolSelect: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  // Registration success page (#registration-success, at /registration/success/) —
  // shown right after submit, before the activation email is confirmed.
  readonly successHeading: Locator;

  // Activation confirmation page (at /regconfirm/{token}, reached via the emailed link) —
  // #membership-content gets an "activation_success" class and shows this heading.
  readonly confirmationCompleteHeading: Locator;

  constructor(page: Page) {
    super(page);

    this.registrationContent = page.locator('#registration-content');
    this.studentOption = page.locator('.user-kind-box[data-kind="student"]');
    this.parentOption = page.locator('.user-kind-box[data-kind="parent"]');
    this.teacherOption = page.locator('.user-kind-box[data-kind="teacher"]');
    // Note: the "Българин в чужбина" card uses data-kind="bulgarian" (class is kind-abroad, attribute is not).
    this.bulgarianAbroadOption = page.locator('.user-kind-box[data-kind="bulgarian"]');
    this.otherOption = page.locator('.user-kind-box[data-kind="other"]');

    this.registerWithEmailButton = page.locator('.reg-email');
    this.registerWithFacebookButton = page.locator('.reg-facebook');
    this.backToKindButton = page.locator('#back-wrap');

    this.form = page.locator('#register');
    this.usernameInput = page.locator('#register input[name="username"]');
    this.phoneNumberInput = page.locator('#phone-number-value');
    this.emailInput = page.locator('#field-email input[name="email"]');
    this.passwordInput = page.locator('#field-password input[name="password"]');
    this.password2Input = page.locator('#field-password2 input[name="password2"]');
    this.marketingEmailsCheckbox = page.locator('#customCheck2');
    this.termsCheckbox = page.locator('#customCheck1');
    // Real <select> elements underneath the bootstrap-select dropdown UI — selectOption() works
    // directly on them without needing to drive the fancy dropdown widget.
    this.gradeSelect = page.locator('#grade-filter');
    this.citySelect = page.locator('#city');
    // Disabled until a city is chosen — city selection triggers a real request
    // (GET /membership/registration_schools?town=...) that populates this list.
    this.schoolSelect = page.locator('#school-filter');
    this.nextButton = page.locator('#register #next');
    this.backButton = page.locator('#register #back');
    this.submitButton = page.locator('#register #send_data');
    this.errorMessage = page.locator('#register .error-message-line');

    this.successHeading = page.locator('#registration-success');
    this.confirmationCompleteHeading = page.locator('#registration-complete');
  }

  async goto() {
    await this.page.goto('/registration/');
  }

  optionFor(kind: UserKind): Locator {
    const byKind: Record<UserKind, Locator> = {
      student: this.studentOption,
      parent: this.parentOption,
      teacher: this.teacherOption,
      bulgarian: this.bulgarianAbroadOption,
      other: this.otherOption,
    };
    return byKind[kind];
  }

  /**
   * Selects a user kind on step 1 and waits for the email/Facebook choice to appear.
   * The cards' click handler is bound after the registration JS bundle finishes loading —
   * clicking before that is a silent no-op, so retry until the follow-up request fires.
   */
  async selectUserKind(kind: UserKind) {
    await retryClick(this.optionFor(kind), () =>
      this.page.waitForResponse((r) => r.url().includes('/reg/select-registration-type'), { timeout: 5000 })
    );
  }

  /** Chooses "Регистрирай се с имейл" and waits for the #register form to be revealed. */
  async chooseEmailRegistration() {
    await retryClick(this.registerWithEmailButton, () =>
      this.page.waitForResponse((r) => r.url().includes('/reg/select-kind'), { timeout: 5000 })
    );
  }

  /**
   * Sub-step 1 of the #register form: username + phone number, then advance.
   * The #next click is subject to the same click-handler race as elsewhere on the site —
   * confirmed to flake under parallel load even mid-flow, not just right after page load —
   * so it retries until the next sub-step's field appears.
   */
  async fillAccountDetails(username: string, phone: string) {
    await this.usernameInput.fill(username);
    await this.phoneNumberInput.fill(phone);
    await retryClick(this.nextButton, () => this.emailInput.waitFor({ state: 'visible', timeout: 5000 }));
  }

  /** Sub-step 2: email + password (entered twice), then advance. */
  async fillCredentials(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.password2Input.fill(password);
    await retryClick(this.nextButton, () => this.gradeSelect.waitFor({ state: 'visible', timeout: 5000 }));
  }

  /**
   * Sub-step 3 (final): grade, city, and school. School stays disabled until a city
   * is chosen — selecting it triggers a real request that populates the school list.
   */
  async selectGradeCityAndSchool(grade: string, city: string) {
    await this.gradeSelect.selectOption(grade);
    await Promise.all([
      this.page.waitForResponse((r) => r.url().includes('/membership/registration_schools')),
      this.citySelect.selectOption(city),
    ]);
    await this.schoolSelect.selectOption({ index: 1 });
  }

  /** Final submit — same click-handler race as the rest of the form's buttons. */
  async submit() {
    await retryClick(this.submitButton, () =>
      this.page.waitForURL(/\/registration\/success\/$/, { timeout: 5000 })
    );
  }

  /** Drives the full "student" registration flow end to end, up to (not including) submit. */
  async registerStudent(details: {
    username: string;
    phone: string;
    email: string;
    password: string;
    grade: string;
    city: string;
  }) {
    await this.selectUserKind('student');
    await this.chooseEmailRegistration();
    await this.fillAccountDetails(details.username, details.phone);
    await this.fillCredentials(details.email, details.password);
    await this.selectGradeCityAndSchool(details.grade, details.city);
  }
}
