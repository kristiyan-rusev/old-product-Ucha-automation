import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * The Flowplayer 3.14 player on a lesson's video page (/watch/{id}/{slug}). Verified live
 * 2026-10-28 as a guest on the free lesson 8000:
 * - The HLS video plays in Playwright's bundled Chromium; nothing starts by itself (no autoplay).
 * - The controls are custom elements and are `visibility: hidden` before the first play and again
 *   ~3 s after the mouse stops moving over the player — hover the player (`showControls`) before
 *   every click on them.
 * - The skip buttons are bare `<span>`s (no role, label or title) and skip exactly 10 s.
 * - The player has no API method for seeking or speed, so state is read from the `<video>`
 *   element itself (`currentTime`, `paused`, `playbackRate`).
 */
export class LessonVideoPage extends BasePage {
  readonly player: Locator;
  readonly video: Locator;
  readonly bigPlay: Locator;
  readonly smallPause: Locator;
  readonly skipBack: Locator;
  readonly skipForward: Locator;
  readonly speedButton: Locator;
  readonly fullscreenEnter: Locator;
  readonly fullscreenExit: Locator;

  /**
   * @param playerId the player's root id: `ucha-player` for a lesson's own video (default),
   *   `ucha-player-trailer` when the lesson is only a trailer (guest, or no subscription from the
   *   6th lesson on; verified live 2026-11-06).
   */
  constructor(page: Page, private readonly playerId = 'ucha-player') {
    super(page);

    this.player = page.locator(`#${this.playerId}`);
    this.video = this.player.locator('video');
    // The big centre button and the bar's play button share the "Play" label, so both are picked by class.
    this.bigPlay = this.player.locator('.fp-play');
    this.smallPause = this.player.locator('.fp-small-pause');
    this.skipBack = this.player.locator('.fp-backward');
    this.skipForward = this.player.locator('.fp-forward');
    this.speedButton = this.player.locator('summary[aria-label="Speed"]');
    this.fullscreenEnter = this.player.locator('.fp-fullscreen');
    this.fullscreenExit = this.player.locator('.fp-fullscreen-exit');
  }

  /** Opens the lesson and waits until the player script has run and the video can play. */
  async open(path: string) {
    await this.goto(path);
    await this.waitUntilReady();
  }

  /** For a lesson page that is already open: waits until the player script has run and the video can play. */
  async waitUntilReady() {
    // The Flowplayer script is deferred: `window.flowplayer` can still be undefined right after load.
    await this.page.waitForFunction((sel) => {
      const w = window as unknown as { flowplayer?: { instances?: unknown[] } };
      const video = document.querySelector<HTMLVideoElement>(sel);
      return w.flowplayer?.instances?.length === 1 && !!video && video.readyState >= 3;
    }, `#${this.playerId} video`);
  }

  /** The video's length in seconds (a trailer is much shorter than its lesson). */
  duration(): Promise<number> {
    return this.video.evaluate((v: HTMLVideoElement) => v.duration);
  }

  /** Whether the player was set up as a trailer — the player's own `is_trailer` setting. */
  async isTrailer(): Promise<boolean> {
    const params = await this.player.getAttribute('data-params');
    return JSON.parse(params ?? '{}').is_trailer === true;
  }

  /** The controls only exist visibly while the mouse is over the player (or the video is paused). */
  async showControls() {
    await this.player.hover();
  }

  /** Starts playback with the big play button and waits until the video really advances. */
  async play() {
    await this.bigPlay.click();
    await expect(this.player).toHaveClass(/is-playing/);
    await expect.poll(() => this.currentTime()).toBeGreaterThan(2);
  }

  /** Pauses with the bar's pause button. */
  async pause() {
    await this.showControls();
    await this.smallPause.click();
    await expect(this.player).toHaveClass(/is-paused/);
  }

  /** Opens the speed menu and picks a speed by its label, e.g. "1.5x". */
  async chooseSpeed(label: string) {
    await this.showControls();
    await this.speedButton.click();
    await this.player.getByRole('menuitem', { name: label, exact: true }).click();
  }

  /**
   * One click on a skip button, then waits until the seek has finished. A second skip clicked
   * while the player is still seeking is silently ignored (seen live: two quick clicks moved the
   * video by 10 s only), so skips are always taken one at a time.
   */
  async skip(button: Locator) {
    await this.showControls();
    await button.click();
    await this.page.waitForFunction(() => {
      const v = document.querySelector<HTMLVideoElement>('#ucha-player video');
      return !!v && !v.seeking && v.readyState >= 3;
    });
  }

  currentTime(): Promise<number> {
    return this.video.evaluate((v: HTMLVideoElement) => v.currentTime);
  }

  playbackRate(): Promise<number> {
    return this.video.evaluate((v: HTMLVideoElement) => v.playbackRate);
  }

  /** The id of the element shown in fullscreen, or null. It is the player root, not the <video>. */
  fullscreenElementId(): Promise<string | null> {
    return this.page.evaluate(() => document.fullscreenElement?.id ?? null);
  }
}
