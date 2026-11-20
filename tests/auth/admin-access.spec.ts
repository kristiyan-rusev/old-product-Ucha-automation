import { test, expect } from '@playwright/test';
import { AdminAccessPage } from '../../pages/AdminAccessPage';

// Staging checklist row 6. The QA admin login lives in .env (UCHA_ADMIN_EMAIL / UCHA_ADMIN_PASSWORD) and is
// never printed. Look only: the test checks that the panel opens and changes nothing in it.
test.describe('Admin panel — access through the 2FA step', () => {
  test('the QA admin logs in, passes 2FA with the dev code and the admin panel opens', { tag: '@checklist' }, async ({ page }) => {
    const email = process.env.UCHA_ADMIN_EMAIL;
    const password = process.env.UCHA_ADMIN_PASSWORD;
    test.skip(!email || !password, 'UCHA_ADMIN_EMAIL / UCHA_ADMIN_PASSWORD are not set in .env');

    const admin = new AdminAccessPage(page);

    await test.step('The QA admin logs in', async () => {
      await admin.logIn(email!, password!);
      await expect(page).not.toHaveURL(/\/login\//);
    });

    await test.step('The 2FA step: the dev code 111111 is accepted', async () => {
      await admin.gotoAccessVerification();
      await expect(admin.generateCodeButton).toBeVisible();
      await admin.confirmWithCode('111111');
    });

    await test.step('The admin panel is open', async () => {
      await expect(page).toHaveURL(/\/admin\/adminPanel\.php$/);
      await expect(page).toHaveTitle('Уча.се - Контрол панел');
      await expect(admin.panelHeading).toBeVisible();
    });
  });
});
