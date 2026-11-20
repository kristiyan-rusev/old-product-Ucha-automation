import { test, expect } from '../../utils/fixtures';
import { ChemistryKeysPage } from '../../pages/ChemistryKeysPage';
import { LessonVideoPage } from '../../pages/LessonVideoPage';
import { SubscriptionPage } from '../../pages/SubscriptionPage';
import { permanentAccount } from '../../utils/permanentAccount';
import { fibankTestCard } from '../../test-data/fibank-test-card';

// Staging Checklist TC_S007 — "Купуване на ключове по Химия" — and using a key, in one story (the user's review,
// 2026-11-20: the separate "no keys / default package" and "buying 3 keys" tests did the same as this one). Prices
// verified live 2026-10-07 (marketing-configurable — confirm with the team before updating).
// A chemistry lesson for university candidates that needs a key (verified live 2026-11-03). Not every lesson under
// /videos/himiya-kandidat-studenti/ does: e.g. /watch/11105/… and /watch/14003/… play without keys.
const CHEMISTRY_LESSON = '/watch/14007/zatvoreni-vaprosi-71-84-neorganichna-himia-2022-g';

test.describe('Chemistry keys', () => {
  test('an account with no keys buys 3 by card, and one key unlocks a chemistry video that then plays', { tag: ['@story', '@checklist'] }, async ({ page }, testInfo) => {
    test.setTimeout(240_000);
    await permanentAccount(page, testInfo, 'keysunlock'); // the reset zeroes the keys and removes the unlock
    const keys = new ChemistryKeysPage(page);
    const lesson = new LessonVideoPage(page);

    await test.step('no keys and no unlocked videos yet', async () => {
      await keys.gotoMyKeys();
      await expect(keys.remainingKeys).toHaveText(/Оставащи ключове:\s*0/);
      await expect(keys.content).toContainText('Нямаш отключени видеа');
    });

    await test.step('the buy page preselects the default package: 60 + 20 free keys for 61,36 €', async () => {
      await keys.gotoBuy();
      await expect(keys.packageCard('80')).toHaveClass(/\bselected\b/);
      await expect(keys.orderSummary).toContainText('60 + 20 подарък = 80 ключа');
      await expect(keys.orderSummary).toContainText('61,36 €');
    });

    await test.step('buy 3 keys (7,67 €) by card', async () => {
      await keys.selectPackage('3');
      await expect(keys.orderSummary).toContainText('7,67 €');
      await keys.proceedToCardCheckout();
      await expect(page.locator('body')).toContainText('Активиране на 3 ключа');
      await new SubscriptionPage(page).payWithCard(fibankTestCard);
      await expect(keys.content).toContainText('Ти успешно закупи 3 ключа за видео уроци по химия за кандидат-студенти');
      await keys.gotoMyKeys();
      await expect(keys.remainingKeys).toHaveText(/Оставащи ключове:\s*3/);
    });

    await test.step('the chemistry lesson is locked and asks for a key', async () => {
      await page.goto(CHEMISTRY_LESSON);
      await expect(keys.lockedScreen).toContainText('е необходимо да го отключиш');
      await expect(keys.lockedScreen).toContainText('Отключи този видео урок с 1 ключ');
      await expect(keys.lockedScreen).toContainText('Твоите налични ключове в момента са: 3 ключа');
      await expect(lesson.player).toHaveCount(0);
    });

    await test.step('unlocking it with a key shows the player, and the video plays', async () => {
      await keys.unlockVideo();
      await expect(keys.unlockSuccessModal).toContainText('Ти успешно отключи избраното видео.');
      await keys.closeUnlockSuccess();

      await expect(keys.lockedScreen).toHaveCount(0);
      await lesson.open(CHEMISTRY_LESSON);
      await lesson.play();
    });

    await test.step('one key is used up and the video is listed as unlocked', async () => {
      await keys.gotoMyKeys();
      await expect(keys.remainingKeys).toHaveText(/Оставащи ключове:\s*2/);
      await expect(keys.unlockedVideos.locator('a.video-slide-link')).toHaveCount(1);
      await expect(keys.unlockedVideos.locator(`a[href$="${CHEMISTRY_LESSON}"]`)).toContainText('активно до');
    });
  });
});
