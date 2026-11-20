import { test, expect } from '@playwright/test';
import { LessonContentPage } from '../../pages/LessonContentPage';
import { LessonVideoPage } from '../../pages/LessonVideoPage';

// Staging Checklist rows 22 + 26 — what a guest gets from lessons, tests and mind maps.
// 6. клас Математика: lessons 1–5 of the grade are free (8000–8004), from the 6th (8005) on
// a guest only sees a trailer. The ids are stable seed content on dev.
const freeLesson = {
  video: '/watch/8000/nachalen-pregovor-delimost',
  test: '/testove/6161/delimost-nachalen-pregovor',
  mindMap: '/pregovor/2099/nachalen-pregovor-delimost',
};
const lockedLesson = {
  video: '/watch/8005/nachalen-pregovor-geometrichni-figuri',
};
// Lesson 6's test and mind map for a guest are not checked: the user found them not needed (review, 2026-11-20).

test.describe('Content access — guest', () => {
  test('a free lesson (1 of the grade) is marked as a free video', { tag: '@checklist' }, async ({ page }) => {
    const lesson = new LessonContentPage(page);
    const video = new LessonVideoPage(page);
    await video.open(freeLesson.video);

    await expect(lesson.freeVideoGuestMessage).toContainText(
      'Това е безплатен видео урок. Регистрирай се, за да разбереш как да използваш всички над 27 000 видео урока, теста и преговора с мисловни карти в най-награждавания образователен сайт!'
    );
    await expect(lesson.trailerGuestMessage).toHaveCount(0);

    expect(await video.isTrailer()).toBe(false);
    await video.play();
  });

  test('a later lesson (6 of the grade) is only a trailer', { tag: '@checklist' }, async ({ page }) => {
    const lesson = new LessonContentPage(page);
    const trailer = new LessonVideoPage(page, 'ucha-player-trailer');
    await trailer.open(lockedLesson.video);

    await expect(lesson.trailerGuestMessage).toContainText(
      'Това е трейлър с избрани моменти от видео урока! Регистрирай се, за да гледаш всички над 27 000 видео урока в най-награждавания образователен сайт!'
    );
    await expect(lesson.freeVideoGuestMessage).toHaveCount(0);

    expect(await trailer.isTrailer()).toBe(true);
    await trailer.play();
  });

  test("the test of lesson 1 can't be taken without registering", { tag: '@checklist' }, async ({ page }) => {
    const content = new LessonContentPage(page);
    await content.goto(freeLesson.test);

    await expect(content.testGuestPrompt).toHaveText('За да разбереш как да направиш теста, регистрирай се в Уча.се!');
  });

  test('the mind map of lesson 1 is shown and downloads as an image', async ({ page }) => {
    const content = new LessonContentPage(page);
    await content.goto(freeLesson.mindMap);

    await expect(content.mindMapDownloadTitle).toHaveText('Изтегли мисловната карта');
    await expect(content.mindMapGuestPrompt).toHaveCount(0);

    const href = await content.mindMapDownloadLink.getAttribute('href');
    expect(href).toContain('/download-mindmap/2099/8000/0');
    const response = await page.request.get(href!);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/jpeg');
    expect(response.headers()['content-disposition']).toContain('attachment');
  });
});
