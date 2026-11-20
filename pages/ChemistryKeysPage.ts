import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { clickWhenReady } from '../utils/clickWhenReady';

export type KeysPackage = '80' | '20' | '3';

// `data-id`s of the key packages on /keys/ (verified live 2026-10-07) — "80" is 60 + 20 free.
const PACKAGE_IDS: Record<KeysPackage, string> = { '80': '7', '20': '6', '3': '5' };

/**
 * Chemistry keys for university candidates ("Ключове по химия за кандидат-студенти") — a
 * separate product from the subscription: one key unlocks one /watch/ video of
 * /videos/himiya-kandidat-studenti/ for 3 months.
 *
 * /my-keys/ ("Моите ключове…"): "Оставащи ключове: N", the unlocked videos, and "Зареди
 * ключове" → /keys/. /keys/ uses the same package/payment card pattern as /subscription/:
 * packages 60+20 (default, 61,36 €), 20 and 3 (7,67 €); payment card (default) / cash /
 * ePay; "Зареди ключове" (#subscribe-button) → FIBank ("Активиране на N ключа…") →
 * /payment/final/success ("Браво! Ти успешно закупи …").
 */
export class ChemistryKeysPage extends BasePage {
  readonly orderSummary: Locator;
  readonly buyButton: Locator;
  readonly remainingKeys: Locator;
  readonly content: Locator;
  readonly lockedScreen: Locator;
  readonly unlockButton: Locator;
  readonly unlockConfirmModal: Locator;
  readonly confirmUnlockButton: Locator;
  readonly unlockSuccessModal: Locator;
  readonly unlockedVideos: Locator;

  constructor(page: Page) {
    super(page);

    // A locked chemistry lesson (/watch/{id}/…) shows this screen instead of the player: the key price, the
    // keys the user has, "Отключи това видео" → a confirmation modal → "Потвърждавам" → a success modal
    // (POST /video/{id}/unlock); closing the success modal reloads the lesson.
    this.lockedScreen = page.locator('#chemistry-locked-video-screen');
    this.unlockButton = page.locator('#unlock-video-btn');
    this.unlockConfirmModal = page.locator('#modal-unlock-video');
    this.confirmUnlockButton = page.locator('#confirm-unlock-video-btn');
    this.unlockSuccessModal = page.locator('#modal-unlock-video-success');
    this.unlockedVideos = page.locator('#user-unlocked-videos');

    this.orderSummary = page.locator('#wrap');
    this.buyButton = page.locator('#subscribe-button');
    this.remainingKeys = page.locator('#wrap').getByText(/Оставащи ключове:\s*\d+/);
    this.content = page.locator('#wrap');
  }

  async gotoBuy() {
    await this.page.goto('/keys/');
  }

  async gotoMyKeys() {
    await this.page.goto('/my-keys/');
  }

  /** "Отключи това видео" → confirm → the success modal. Closing that modal is left to the caller. */
  async unlockVideo() {
    await clickWhenReady(this.unlockButton, () => this.unlockConfirmModal.waitFor({ state: 'visible', timeout: 5000 }));
    await clickWhenReady(this.confirmUnlockButton, () => this.unlockSuccessModal.waitFor({ state: 'visible', timeout: 10000 }));
  }

  /** Closes the success modal — the lesson then reloads by itself and shows the player. */
  async closeUnlockSuccess() {
    await this.unlockSuccessModal.getByRole('button', { name: 'Close' }).click();
  }

  packageCard(pkg: KeysPackage): Locator {
    return this.page.locator(`[data-id="${PACKAGE_IDS[pkg]}"][data-object_type="package"]`);
  }

  async selectPackage(pkg: KeysPackage) {
    if (pkg === '80') return; // the default
    await clickWhenReady(this.packageCard(pkg), () =>
      this.page.locator(`[data-id="${PACKAGE_IDS[pkg]}"][data-object_type="package"].selected`).waitFor({ state: 'visible', timeout: 5000 })
    );
  }

  /** "Зареди ключове" with card payment (the default) → FIBank's checkout. */
  async proceedToCardCheckout() {
    await clickWhenReady(this.buyButton, () => this.page.waitForURL(/mdpay-test\.fibank\.bg/, { timeout: 15000 }));
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }
}
