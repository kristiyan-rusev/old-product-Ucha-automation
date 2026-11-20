import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoginPage } from './LoginPage';
import { RegistrationPage } from './RegistrationPage';
import { ProfileSettingsPage } from './ProfileSettingsPage';
import { clickWhenReady, waitUntilClickable } from '../utils/clickWhenReady';
import { FACEBOOK_SESSION_HELP } from '../utils/facebookSession';

/**
 * Registering, logging in and deactivating with Facebook. Every one of these opens a Facebook popup
 * (https://www.facebook.com/privacy/consent/): with the saved Facebook session of the test account
 * it only asks "В предишен момент сте влезли в Ucha.dev с Facebook. Искате ли да продължите?" and one
 * click on "Продължете като …" closes it again — the test never types a Facebook password. Needs the
 * context to carry the saved session (utils/facebookSession.ts).
 *
 * Site facts (checked live): Facebook registration has two steps (name + phone, then grade / city /
 * school) and ends logged in on "/"; the account has no password, so deactivating it asks for the
 * Facebook popup again instead of a password; logging in with a Facebook profile that has no account
 * shows an error on /login/.
 */
export class FacebookAuthPage extends BasePage {
  readonly registration: RegistrationPage;
  readonly loginPage: LoginPage;
  readonly settings: ProfileSettingsPage;
  readonly deactivateWithFacebookButton: Locator;
  readonly noAccountMessage: Locator;
  readonly deletedMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.registration = new RegistrationPage(page);
    this.loginPage = new LoginPage(page);
    this.settings = new ProfileSettingsPage(page);
    // Inside the last deactivation modal, in place of the password field.
    this.deactivateWithFacebookButton = this.settings.deleteConfirmModal.locator('#fb-auth');
    this.noAccountMessage = page.getByText('Нямаш регистрация в Уча.се с този Facebook профил');
    this.deletedMessage = page.getByText('Профилът ти беше успешно изтрит! Ще ни липсваш!');
  }

  /** Clicks a "with Facebook" button and confirms Facebook's "continue" popup. */
  private async confirmInFacebookPopup(trigger: Locator) {
    await waitUntilClickable(trigger);
    const popupOpened = this.page.waitForEvent('popup', { timeout: 15_000 });
    await trigger.click();
    const popup = await popupOpened;
    const continueButton = popup.getByRole('button', { name: /^Продължете като/ });
    const facebookLoginForm = popup.locator('input[name="pass"]');
    // Either popup state may show; `.or()` can match both elements, so `.first()` avoids a strict-mode error.
    await continueButton.or(facebookLoginForm).first().waitFor({ state: 'visible', timeout: 20_000 });
    if (await facebookLoginForm.isVisible()) {
      throw new Error(`Facebook asks to log in — the saved Facebook session has expired: ${FACEBOOK_SESSION_HELP}`);
    }
    await clickWhenReady(continueButton, () => popup.waitForEvent('close', { timeout: 8_000 }));
  }

  /** Регистрация → student → with Facebook → phone → grade, city, school → registered and logged in on "/". */
  async registerStudent(details: { phone: string; grade: string; city: string }) {
    const reg = this.registration;
    await reg.goto();
    await reg.selectUserKind('student');
    await this.confirmInFacebookPopup(reg.registerWithFacebookButton);
    // The name comes from the Facebook profile; only the phone is asked for.
    await reg.phoneNumberInput.fill(details.phone);
    await clickWhenReady(reg.nextButton, () => reg.citySelect.waitFor({ state: 'visible', timeout: 5000 }));
    await reg.selectGradeCityAndSchool(details.grade, details.city);
    await clickWhenReady(reg.submitButton, () =>
      this.page.waitForURL((url) => url.pathname === '/', { timeout: 15_000 })
    );
  }

  /** Вход с Facebook from /login/. True when it logged in, false when this Facebook profile has no account. */
  async logIn(): Promise<boolean> {
    await this.loginPage.goto();
    await this.confirmInFacebookPopup(this.loginPage.facebookButton);
    await Promise.race([
      this.page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 20_000 }),
      this.noAccountMessage.waitFor({ state: 'visible', timeout: 20_000 }),
    ]);
    return !new URL(this.page.url()).pathname.startsWith('/login');
  }

  /** Deactivates the logged-in account: SMS code (111111 on dev), a reason, then Facebook instead of a password. */
  async deactivate() {
    const settings = this.settings;
    await settings.goto();
    await settings.startDeactivation();
    await settings.verifyWithCode('111111');
    await settings.submitReason(1);
    await this.confirmInFacebookPopup(this.deactivateWithFacebookButton);
    await this.page.waitForURL((url) => url.pathname.startsWith('/login'), { timeout: 20_000 });
  }

  /** Makes sure the Facebook profile has no Уча.се account: logs in with it if there is one and deactivates it. */
  async removeAccountIfExists() {
    if (await this.logIn()) await this.deactivate();
  }
}
