import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { clickWhenReady } from '../utils/clickWhenReady';

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
  // Same two radio inputs (#profile-student/#profile-pre-school) are reused across kinds
  // with different label text and effect: for parent, "Ученик"/"Дете в детска градина"
  // (switches gradeSelect between grades and preschool groups); for teacher, "Учител в
  // училище"/"Учител в детска градина" (no visible effect — teacher has no gradeSelect at
  // all). Absent entirely for student.
  readonly profileStudentRadio: Locator;
  readonly profilePreSchoolRadio: Locator;
  readonly profileStudentLabel: Locator;
  readonly profilePreSchoolLabel: Locator;
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
    this.profileStudentRadio = page.locator('#profile-student');
    this.profilePreSchoolRadio = page.locator('#profile-pre-school');
    this.profileStudentLabel = page.locator('label[for="profile-student"]');
    this.profilePreSchoolLabel = page.locator('label[for="profile-pre-school"]');
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
    await clickWhenReady(this.optionFor(kind), () =>
      this.page.waitForResponse((r) => r.url().includes('/reg/select-registration-type'), { timeout: 5000 })
    );
  }

  /** Chooses "Регистрирай се с имейл" and waits for the #register form to be revealed. */
  async chooseEmailRegistration() {
    await clickWhenReady(this.registerWithEmailButton, () =>
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
    await clickWhenReady(this.nextButton, () => this.emailInput.waitFor({ state: 'visible', timeout: 5000 }));
  }

  /**
   * Sub-step 2: email + password (entered twice), then advance.
   * Waits on citySelect rather than gradeSelect — the teacher kind's final sub-step has
   * no grade selector at all (teachers aren't assigned a grade/group), so gradeSelect
   * never appears there, but citySelect is present across student, parent, and teacher.
   */
  async fillCredentials(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.password2Input.fill(password);
    await clickWhenReady(this.nextButton, () => this.citySelect.waitFor({ state: 'visible', timeout: 5000 }));
  }

  /**
   * "Other" kind only: the credentials sub-step IS the final sub-step — there's no
   * grade/city/school to collect (gradeSelect/citySelect/schoolSelect don't exist in the
   * DOM at all for this kind), so nextButton stays permanently hidden and submitButton
   * ("Регистрирай се") is already visible alongside email/password. Fills the fields
   * directly rather than going through fillCredentials()'s click-and-wait-for-citySelect,
   * which would never resolve here.
   */
  async fillFinalCredentials(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.password2Input.fill(password);
  }

  /**
   * Parent kind only: switches whether the child is a school student or preschool-age,
   * which re-renders gradeSelect's options in place (grades 1-12 vs. groups 1-4) — same
   * click-handler-binds-late race as every other control on this form.
   */
  async selectProfileType(type: 'student' | 'pre-school') {
    const label = type === 'student' ? this.profileStudentLabel : this.profilePreSchoolLabel;
    const expectedFirstOption = type === 'student' ? 'Избери клас' : 'Избери група';
    await clickWhenReady(label, () =>
      this.page.waitForFunction(
        (expected) => document.querySelector('#grade-filter option')?.textContent === expected,
        expectedFirstOption,
        { timeout: 5000 }
      )
    );
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

  /** Teacher kind's final sub-step: city and school only — there is no grade selector. */
  async selectCityAndSchool(city: string) {
    await Promise.all([
      this.page.waitForResponse((r) => r.url().includes('/membership/registration_schools')),
      this.citySelect.selectOption(city),
    ]);
    await this.schoolSelect.selectOption({ index: 1 });
  }

  /** Final submit — same click-handler race as the rest of the form's buttons. */
  async submit() {
    await clickWhenReady(this.submitButton, () =>
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

  /** Drives the full "parent" registration flow end to end, up to (not including) submit. */
  async registerParent(details: {
    username: string;
    phone: string;
    email: string;
    password: string;
    profileType: 'student' | 'pre-school';
    grade: string;
    city: string;
  }) {
    await this.selectUserKind('parent');
    await this.chooseEmailRegistration();
    await this.fillAccountDetails(details.username, details.phone);
    await this.fillCredentials(details.email, details.password);
    if (details.profileType === 'pre-school') {
      await this.selectProfileType('pre-school');
    }
    await this.selectGradeCityAndSchool(details.grade, details.city);
  }

  /** Drives the full "teacher" registration flow end to end, up to (not including) submit. */
  async registerTeacher(details: { username: string; phone: string; email: string; password: string; city: string }) {
    await this.selectUserKind('teacher');
    await this.chooseEmailRegistration();
    await this.fillAccountDetails(details.username, details.phone);
    await this.fillCredentials(details.email, details.password);
    await this.selectCityAndSchool(details.city);
  }

  /**
   * Drives the full "bulgarian abroad" registration flow end to end, up to (not including)
   * submit. Same shape as teacher (city + school, no grade selector, no profile-type
   * radio) — only difference is citySelect lists "Country, City" pairs abroad instead of
   * Bulgarian towns, and it accepts the same value/label string either way.
   */
  async registerBulgarianAbroad(details: { username: string; phone: string; email: string; password: string; city: string }) {
    await this.selectUserKind('bulgarian');
    await this.chooseEmailRegistration();
    await this.fillAccountDetails(details.username, details.phone);
    await this.fillCredentials(details.email, details.password);
    await this.selectCityAndSchool(details.city);
  }

  /**
   * Drives the full "other" registration flow end to end, up to (not including) submit.
   * Only two sub-steps total (account details, then credentials) — see
   * fillFinalCredentials's doc comment for why there's no third sub-step here.
   */
  async registerOther(details: { username: string; phone: string; email: string; password: string }) {
    await this.selectUserKind('other');
    await this.chooseEmailRegistration();
    await this.fillAccountDetails(details.username, details.phone);
    await this.fillFinalCredentials(details.email, details.password);
  }
}
