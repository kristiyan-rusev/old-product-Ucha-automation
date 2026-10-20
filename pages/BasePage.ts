import { Page, Locator } from '@playwright/test';
import { clickWhenReady } from '../utils/clickWhenReady';

export class BasePage {
  readonly page: Page;

  // Header
  readonly logo: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;
  readonly userNavToggler: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.logo = page.locator('a.logo, .site-logo').first();
    this.loginLink = page.locator('a[href*="/login/"]').first();
    this.registerLink = page.locator('a[href*="/registration/"]').first();
    // Avatar in the header — clicking it expands the #user-nav dropdown (Моите уроци, Моят профил, ..., Изход)
    this.userNavToggler = page.locator('.user-nav-toggler').first();
    this.logoutLink = page.locator('a[href*="/logout/"]').first();
  }

  async goto(path: string) {
    await this.page.goto(path);
  }

  /**
   * Opens the user-nav dropdown and clicks "Изход". Same click-handler-binds-late race as
   * elsewhere on the site (confirmed here too — the toggler's click sometimes lands before
   * its handler is bound, silently doing nothing), so this retries until the dropdown
   * actually opens.
   */
  async logout() {
    await clickWhenReady(this.userNavToggler, () => this.logoutLink.waitFor({ state: 'visible', timeout: 5000 }));
    await this.logoutLink.click();
  }
}
