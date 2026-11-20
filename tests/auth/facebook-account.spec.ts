import { test, expect } from '@playwright/test';
import { FacebookAuthPage } from '../../pages/FacebookAuthPage';
import { facebookSessionOptions, requireFacebookSession } from '../../utils/facebookSession';

// Staging Checklist rows 12 (registration with Facebook) and 3 (login with Facebook), as one story on
// the Facebook test account — its Уча.се account is removed and recreated on every run. The test never
// logs in to Facebook: its browser carries the saved Facebook session and browser identity
// (scripts/save-facebook-session.ts), so Facebook's popup only asks to continue.
test.use(facebookSessionOptions());

const PHONE = '888123456';

test.describe('Facebook account — register, log out, log in, deactivate', () => {
  // Safety net: if a step failed, don't leave the Facebook profile registered (the next run would
  // start by removing it anyway, but dev shouldn't keep it overnight).
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'passed' || !facebookSessionOptions().storageState) return;
    await new FacebookAuthPage(page).removeAccountIfExists().catch((e: Error) => {
      console.warn(`[facebook] couldn't remove the Facebook test account: ${e.message.split('\n')[0]}`);
    });
  });

  test('register with Facebook, log out, log in with Facebook, deactivate', { tag: ['@story', '@checklist'] }, async ({ page }) => {
    test.setTimeout(5 * 60_000);
    requireFacebookSession();
    const facebook = new FacebookAuthPage(page);

    await test.step('remove an account left from an earlier run', async () => {
      // One Facebook login: no account → nothing to do; an account → it's deactivated. That a
      // deactivated account can't log in is checked at the end of the story.
      await facebook.removeAccountIfExists();
    });

    await test.step('register as a student with Facebook', async () => {
      await facebook.registerStudent({ phone: PHONE, grade: '7', city: 'София' });
      await facebook.closeOnboardingOverlay();
      await expect(page).toHaveURL(/\/$/);
      await expect(facebook.userNavToggler).toBeVisible();
      await expect(facebook.loginLink).toHaveCount(0);
    });

    await test.step('log out', async () => {
      await facebook.logout();
      await expect(facebook.loginLink).toBeVisible();
      await expect(facebook.userNavToggler).toHaveCount(0);
    });

    await test.step('log in with Facebook — the same account', async () => {
      expect(await facebook.logIn(), 'Facebook login must find the account registered a moment ago').toBe(true);
      await facebook.closeOnboardingOverlay();
      await expect(facebook.userNavToggler).toBeVisible();
      // The grade chosen at registration is on the account.
      await facebook.settings.goto();
      await expect(facebook.settings.schoolClassPreview).toContainText('7. клас');
    });

    await test.step('deactivate the account, so the next run can register again', async () => {
      await facebook.deactivate();
      await expect(facebook.deletedMessage).toBeVisible();
      expect(await facebook.logIn(), 'the deactivated account must not log in').toBe(false);
      await expect(facebook.noAccountMessage).toBeVisible();
    });
  });
});
