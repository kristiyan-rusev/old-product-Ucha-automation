import { test, expect } from '@playwright/test';
import { LessonContentPage } from '../../pages/LessonContentPage';

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
  test: '/testove/6166/geometrichni-figuri-nachalen-pregovor',
  mindMap: '/pregovor/2104/nachalen-pregovor-geometrichni-figuri',
};

test.describe('Content access — guest', () => {
  test('a free lesson (1 of the grade) is marked as a free video', async ({ page }) => {
    const lesson = new LessonContentPage(page);
    await lesson.goto(freeLesson.video);

    await expect(lesson.freeVideoGuestMessage).toContainText(
      'Това е безплатен видео урок. Регистрирай се, за да разбереш как да използваш всички над 27 000 видео урока, теста и преговора с мисловни карти в най-награждавания образователен сайт!'
    );
    await expect(lesson.trailerGuestMessage).toHaveCount(0);
  });

  test('a later lesson (6 of the grade) is only a trailer', async ({ page }) => {
    const lesson = new LessonContentPage(page);
    await lesson.goto(lockedLesson.video);

    await expect(lesson.trailerGuestMessage).toContainText(
      'Това е трейлър с избрани моменти от видео урока! Регистрирай се, за да гледаш всички над 27 000 видео урока в най-награждавания образователен сайт!'
    );
    await expect(lesson.freeVideoGuestMessage).toHaveCount(0);
  });

  for (const [name, lesson] of [
    ['lesson 1', freeLesson],
    ['lesson 6', lockedLesson],
  ] as const) {
    test(`the test of ${name} can't be taken without registering`, async ({ page }) => {
      const content = new LessonContentPage(page);
      await content.goto(lesson.test);

      await expect(content.testGuestPrompt).toHaveText('За да разбереш как да направиш теста, регистрирай се в Уча.се!');
    });
  }

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

  test('the mind map of lesson 6 asks to register and its download link gives no file', async ({ page }) => {
    const content = new LessonContentPage(page);
    await content.goto(lockedLesson.mindMap);

    await expect(content.mindMapGuestPrompt).toContainText('За да видиш преговора, регистрирай се в Уча.се!');
    await expect(content.mindMapDownloadTitle).toHaveCount(0);

    // Opening the download URL directly must not hand out the image either.
    const response = await page.request.get('/download-mindmap/2104/8005/0');
    expect(response.headers()['content-type']).not.toContain('image/');
    expect(response.headers()['content-disposition'] ?? '').not.toContain('attachment');
  });
});
