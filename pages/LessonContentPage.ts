import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { clickWhenReady } from '../utils/clickWhenReady';

/**
 * The three pages of one lesson unit — video (/watch/{id}/{slug}), test (/testove/{id}/{slug})
 * and mind map (/pregovor/{id}/{slug}). Verified live 2026-10-26 as a guest:
 * - /watch: the player carries a hint bubble (`#free_video_guest` on the first 5 lessons of a
 *   grade, `#trailer_guest` from the 6th on). It is a player cue point shown ~30 s into
 *   playback, so it's in the DOM but hidden — assert its text, not its visibility.
 * - /testove: a guest sees the question preview and a "register" prompt instead of "Започни теста".
 * - /pregovor: the first 5 lessons show the map plus a download link
 *   (/download-mindmap/{mapId}/{lessonId}/0 → image attachment); from the 6th on the page says
 *   to register and the download URL returns HTML instead of a file.
 */
export class LessonContentPage extends BasePage {
  readonly freeVideoGuestMessage: Locator;
  readonly trailerGuestMessage: Locator;
  readonly testGuestPrompt: Locator;
  readonly mindMapGuestPrompt: Locator;
  readonly mindMapDownloadLink: Locator;
  readonly mindMapDownloadTitle: Locator;
  // Logged in without a subscription (verified live 2026-10-28, fresh student): the same cue-point
  // bubbles with other ids and text, each with an "Активирай абонамент" button to /subscription/.
  readonly freeVideoMessage: Locator;
  readonly trailerMessage: Locator;
  readonly trailerSubscribeButton: Locator;
  readonly startTestButton: Locator;
  readonly testSubscribePrompt: Locator;
  readonly testSubscribeButtons: Locator;
  readonly firstQuestion: Locator;

  constructor(page: Page) {
    super(page);

    this.freeVideoMessage = page.locator('#free_video_unsubscribed');
    this.trailerMessage = page.locator('#trailer_unsubscribed');
    this.trailerSubscribeButton = page.locator('#trailer_unsubscribed_btn');
    // "Започни теста" above the question preview (#start-exercise-down is its copy below it).
    this.startTestButton = page.locator('#start-exercise');
    // No id / data-qa on the prompt paragraph; it appears twice (above and below the preview).
    this.testSubscribePrompt = page.locator('#wrap p.text-m-bold').filter({ hasText: 'За да направиш теста' });
    // The same data-qa is on the two copies of the button (top of the page and under the preview).
    this.testSubscribeButtons = page.locator('a[data-qa="exercise-start-subscription-top-button"]');
    this.firstQuestion = page.locator('#question-item-1');

    this.freeVideoGuestMessage = page.locator('#free_video_guest');
    this.trailerGuestMessage = page.locator('#trailer_guest');
    // The "За да разбереш как да направиш теста…" paragraph sits right above the register button.
    this.testGuestPrompt = page.locator('#wrap p.text-m-bold').filter({ hasText: 'За да разбереш как да направиш теста' });
    // `.main-text` is the semantic block holding the locked-mind-map message (no id / data-qa on it).
    this.mindMapGuestPrompt = page.locator('#wrap .main-text').filter({ hasText: 'За да видиш преговора' });
    this.mindMapDownloadLink = page.locator('a.download-mindmap-link[href*="/download-mindmap/"]');
    this.mindMapDownloadTitle = page.locator('.download-mindmap-title');
  }

  /** Clicks "Започни теста" and waits for the questions to load into the same page (no navigation). */
  async startTest() {
    await clickWhenReady(this.startTestButton, () =>
      this.page.waitForResponse((r) => r.url().includes('/load-questions') && r.ok())
    );
  }
}
