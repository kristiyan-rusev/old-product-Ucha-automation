import { test, expect } from '../../utils/fixtures';
import { LessonContentPage } from '../../pages/LessonContentPage';
import { LessonVideoPage } from '../../pages/LessonVideoPage';
import { SubscriptionPage } from '../../pages/SubscriptionPage';
import { DeviceVerificationPage } from '../../pages/DeviceVerificationPage';
import { permanentAccount } from '../../utils/permanentAccount';
import { fibankTestCard } from '../../test-data/fibank-test-card';

// Staging Checklist rows 23, 27 (no subscription), 24, 28 (with a subscription) and 5 (login on a new
// device). One account goes from free to subscribed. Lessons 1–5 of the 6th-grade Математика course
// are free; from the 6th on a video is a trailer and its test is locked until the account subscribes.
const lesson1 = { video: '/watch/8000/nachalen-pregovor-delimost', test: '/testove/6161/delimost-nachalen-pregovor' };
const lesson6 = { video: '/watch/8005/nachalen-pregovor-geometrichni-figuri', test: '/testove/6166/geometrichni-figuri-nachalen-pregovor' };

test.describe('Lessons and tests without and with a subscription', () => {
  test('a free account sees lesson 6 locked, a 12-month subscription opens it, a new device must be verified', { tag: '@checklist' }, async ({
    page,
    browser,
  }, testInfo) => {
    test.setTimeout(420_000);
    const { email, password } = await permanentAccount(page, testInfo, 'subaccess');
    const lesson = new LessonContentPage(page);

    let trailerLength = 0;

    await test.step('without a subscription: lesson 1 video plays as free, lesson 6 is a trailer with the subscribe offer', async () => {
      const freeVideo = new LessonVideoPage(page);
      await freeVideo.open(lesson1.video);
      await expect(lesson.freeVideoMessage).toContainText('Този видео урок е подарък за теб');
      await expect(lesson.trailerMessage).toHaveCount(0);
      expect(await freeVideo.isTrailer()).toBe(false);
      await freeVideo.play();

      const trailer = new LessonVideoPage(page, 'ucha-player-trailer');
      await trailer.open(lesson6.video);
      await expect(lesson.trailerMessage).toContainText('Това е трейлър с избрани моменти от видео урока!');
      await expect(lesson.trailerSubscribeButton).toHaveText('Активирай абонамент');
      await expect(lesson.trailerSubscribeButton).toHaveAttribute('href', /\/subscription\/$/);
      expect(await trailer.isTrailer()).toBe(true);
      trailerLength = await trailer.duration();
      await trailer.play();
    });

    await test.step('without a subscription: the test of lesson 1 starts, the test of lesson 6 is locked', async () => {
      await lesson.goto(lesson1.test);
      await expect(lesson.startTestButton).toHaveText('Започни теста');
      await lesson.startTest();
      await expect(lesson.firstQuestion).toBeVisible();

      await lesson.goto(lesson6.test);
      await expect(lesson.startTestButton).toHaveCount(0);
      await expect(lesson.testSubscribePrompt.first()).toContainText('активирай своя абонамент'); // the prompt is shown twice on the page
      await expect(lesson.testSubscribeButtons.first()).toHaveAttribute('href', /\/subscription\/$/); // two copies of the button
    });

    await test.step('buy a 12-month prepaid subscription with the FIBank sandbox card', async () => {
      const subscription = new SubscriptionPage(page);
      await subscription.goto();
      await subscription.proceedToCheckout('card');
      await subscription.payWithCard(fibankTestCard);
      await expect(page).toHaveURL(/\/payment\/final\/success/);
      await subscription.waitForActiveSubscription();
    });

    await test.step('with the subscription: lesson 6 has no trailer banner, plays in full and its test starts', async () => {
      const fullVideo = new LessonVideoPage(page);
      await fullVideo.open(lesson6.video);
      await expect(lesson.trailerMessage).toHaveCount(0);
      await expect(lesson.trailerSubscribeButton).toHaveCount(0);
      expect(await fullVideo.isTrailer()).toBe(false);
      expect(await fullVideo.duration()).toBeGreaterThan(trailerLength);
      await fullVideo.play();

      await lesson.goto(lesson6.test);
      await expect(lesson.testSubscribePrompt).toHaveCount(0);
      await expect(lesson.startTestButton).toHaveText('Започни теста');
      await lesson.startTest();
      await expect(lesson.firstQuestion).toBeVisible();
    });

    await test.step('login from a new browser asks for device verification, code 111111 lets it in', async () => {
      const newDevice = await browser.newContext({ baseURL: testInfo.project.use.baseURL });
      try {
        const devicePage = new DeviceVerificationPage(await newDevice.newPage());
        await devicePage.logInFromNewDevice(email, password);
        await expect(devicePage.page).toHaveURL(/\/login\/device-verification/);
        await devicePage.confirmWithCode('111111');

        await devicePage.goto('/profile/');
        await expect(devicePage.page).toHaveURL(/\/profile\/$/);
      } finally {
        await newDevice.close();
      }
    });
  });
});
