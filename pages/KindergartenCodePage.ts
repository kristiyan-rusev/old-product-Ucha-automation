import { Page, Locator, Response } from '@playwright/test';
import { BasePage } from './BasePage';
import { clickWhenReady } from '../utils/clickWhenReady';

/**
 * The kindergarten (АДГ) code page /dg (verified live 2026-10-29, logged in as a parent of a
 * pre-school child). The form posts to /kidenrgarten-code-activate (the typo is the site's) and
 * the answer is JSON: `{ status: 'success', data: { state: true, message: <html> } }` — the
 * page then replaces the form with the "Честито!" heading, without navigating.
 */
export class KindergartenCodePage extends BasePage {
  readonly codeInput: Locator;
  readonly activateButton: Locator;
  readonly successHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.codeInput = page.locator('#voucher-code');
    this.activateButton = page.locator('#send-code');
    this.successHeading = page.locator('#kindergarten-code-page h1');
  }

  async open() {
    await this.page.goto('/dg');
  }

  /**
   * Enters the code and activates it. Returns whether the site accepted it, and its answer's
   * `status` for a refusal (so the caller can record a refused code).
   */
  async activate(code: string): Promise<{ accepted: boolean; status: string }> {
    await this.codeInput.fill(code);
    let response!: Response;
    await clickWhenReady(this.activateButton, async () => {
      response = await this.page.waitForResponse((r) => r.url().includes('/kidenrgarten-code-activate'), { timeout: 15_000 });
    });
    const body = await response.json().catch(() => ({}));
    return { accepted: body.status === 'success' && body.data?.state === true, status: String(body.status) };
  }
}
