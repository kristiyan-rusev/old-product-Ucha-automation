import { test, expect } from '@playwright/test';
import { LessonVideoPage } from '../../pages/LessonVideoPage';

// Staging Checklist row 25 — the player's back, forward, speed and full-screen functions on a free
// lesson, as a guest. State is read from the <video> element, never from pixels. The skips stay
// under 30 s of video, where the guest hint bubble starts to show over the player.
const lesson = '/watch/8000/nachalen-pregovor-delimost';

test('video player: forward, back, speed and full screen', { tag: '@checklist' }, async ({ page }) => {
  const video = new LessonVideoPage(page);
  await video.open(lesson);
  await video.play();
  await video.pause();

  await test.step('forward 10 seconds', async () => {
    const before = await video.currentTime();

    await video.skip(video.skipForward);

    await expect.poll(async () => (await video.currentTime()) - before).toBeCloseTo(10, 1);
  });

  await test.step('back 10 seconds', async () => {
    const before = await video.currentTime();

    await video.skip(video.skipBack);

    // The step is 10 s with a floating-point tail (-10.000000000000002), hence the tolerance.
    await expect.poll(async () => (await video.currentTime()) - before).toBeCloseTo(-10, 1);
  });

  await test.step('choose a playback speed', async () => {
    expect(await video.playbackRate()).toBe(1);

    await video.chooseSpeed('1.5x');

    await expect.poll(() => video.playbackRate()).toBe(1.5);
    await expect(video.speedButton).toHaveText('1.5x');
  });

  await test.step('full screen on and off', async () => {
    expect(await video.fullscreenElementId()).toBeNull();

    await video.showControls();
    await video.fullscreenEnter.click();

    // The fullscreen element is the player's root, not the <video> itself.
    await expect.poll(() => video.fullscreenElementId()).toBe('ucha-player');

    await video.showControls();
    await video.fullscreenExit.click();

    await expect.poll(() => video.fullscreenElementId()).toBeNull();
  });
});
