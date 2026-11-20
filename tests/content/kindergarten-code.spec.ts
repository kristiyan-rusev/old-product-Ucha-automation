import { test, expect } from '../../utils/fixtures';
import { KindergartenCodePage } from '../../pages/KindergartenCodePage';
import { LessonContentPage } from '../../pages/LessonContentPage';
import { LessonVideoPage } from '../../pages/LessonVideoPage';
import { permanentAccount } from '../../utils/permanentAccount';
import { claimNextAdgCode, markAdgCodeRejected } from '../../utils/adgCodes';

// Staging Checklist rows 30, 32 / UCHAdocumentation §4.10, §5.9 — a parent of a pre-school child
// activates a valid АДГ code on /dg and gets the kindergarten content. In the 2. група Математика
// course lessons 1–5 are free and the 6th on are trailers for an account without a subscription.
const trailerLesson = '/watch/14136/podrezhdame-tri-predmeta-po-visochina';

test.describe('Kindergarten (АДГ) code', () => {
  test('a pre-school parent activates a valid code and a kindergarten trailer lesson opens fully', { tag: '@checklist' }, async ({ page }, testInfo) => {
    test.setTimeout(300_000);
    // A permanent pre-school parent; the reset also ends the previous run's АДГ subscription. Each run still uses up one code.
    await permanentAccount(page, testInfo, 'kindergarten', { kind: 'preschool-parent' });
    const lesson = new LessonContentPage(page);
    const dg = new KindergartenCodePage(page);

    await test.step('before the code: the kindergarten lesson is a trailer with the subscribe offer, and the trailer plays', async () => {
      // Without a subscription the page has the trailer's own player (as in lessons-with-subscription.spec.ts).
      const trailer = new LessonVideoPage(page, 'ucha-player-trailer');
      await trailer.open(trailerLesson);
      await expect(lesson.trailerMessage).toContainText('Това е трейлър с избрани моменти от видео урока!');
      await expect(lesson.trailerSubscribeButton).toHaveText('Активирай абонамент');
      expect(await trailer.isTrailer()).toBe(true);
      await trailer.play();
    });

    await test.step('activate a valid АДГ code on /dg', async () => {
      await dg.open();
      await expect(dg.codeInput).toBeVisible();

      // The codes were read from a screenshot: a refused one is recorded as rejected and the next is tried once.
      let code = claimNextAdgCode();
      let result = await dg.activate(code);
      if (!result.accepted) {
        markAdgCodeRejected(code);
        testInfo.annotations.push({ type: 'adg-code-rejected', description: `code ${code} refused (answer status "${result.status}")` });
        code = claimNextAdgCode();
        result = await dg.activate(code);
        if (!result.accepted) markAdgCodeRejected(code);
      }
      expect(result.accepted, 'the site accepted an АДГ code').toBe(true);

      await expect(dg.successHeading).toContainText('Честито! Твоят безплатен абонамент за детски градини в Уча.се е вече активен!');
    });

    await test.step('after the code: the same lesson has no trailer banner and no subscribe offer, and its video plays', async () => {
      const video = new LessonVideoPage(page);
      await video.open(trailerLesson);
      await expect(lesson.trailerMessage).toHaveCount(0);
      await expect(lesson.trailerSubscribeButton).toHaveCount(0);

      expect(await video.isTrailer()).toBe(false);
      await video.play();
    });
  });
});
