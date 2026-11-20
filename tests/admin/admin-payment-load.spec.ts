import { test, expect } from '../../utils/fixtures';
import { AdminPaymentLoadPage } from '../../pages/AdminPaymentLoadPage';
import { ProfileSubscriptionPage } from '../../pages/ProfileSubscriptionPage';
import { permanentAccount } from '../../utils/permanentAccount';
import { openAdminPage } from '../../utils/adminSession';

// Admin → "Зареждане на пакети": the QA admin loads "1 месец" as "Подарък от Уча.се" onto the test's own permanent
// account (the user's item, 2026-11-05). The account is reset on /set-data.php at the start, and again right after the
// last step, in the same window — no new login for the reset (utils/fixtures.ts; the user's review, 2026-11-19). That method only adds the subscription, its payment record and a bell
// notification — no email, no auto-renewal change, no voucher (source: PaymentUser::chargeFreePayment). The account
// opens /profile/subscription/ first: on an account that never did, the load fails halfway (ATTENTION.md, 2026-11-05).
test.describe('Admin — loading a package onto an account', () => {
  test('the QA admin loads "1 месец" as a gift from Уча.се and the account gets it', { tag: '@story' }, async ({ page, browser }, testInfo) => {
    test.setTimeout(15 * 60_000);
    const { email } = await permanentAccount(page, testInfo, 'adminload');
    const profile = new ProfileSubscriptionPage(page);

    await test.step('the account has no subscription yet', async () => {
      await profile.goto();
      await expect(profile.noSubscriptionTitle).toBeVisible();
    });

    // The admin works in a second browser context, so the student stays logged in.
    const { context, page: adminPage } = await test.step('the QA admin logs in, passes 2FA and opens "Зареждане на пакети"', () =>
      openAdminPage(browser, testInfo.project.use.baseURL!, AdminPaymentLoadPage.PATH)
    );
    let activeUntil = '';
    try {
      const load = new AdminPaymentLoadPage(adminPage);

      await test.step('"Проверете" finds the account, without a subscription', async () => {
        await load.checkEmail(email);
        await expect(load.info).toContainText('Име:');
        await expect(load.info).toContainText('QASubscription');
        await expect(load.lastSubscription).toContainText(/Абонамент за цялото съдържание:\s*няма/);
        await expect(load.history).toContainText('Хронология на плащания');
        await expect(load.history).toContainText('Все още нямаш регистрирани плащания');
      });

      await test.step('"1 месец" → "Подарък от Уча.се" → the preview', async () => {
        await load.choosePackage(AdminPaymentLoadPage.ONE_MONTH);
        await load.chooseMethod(AdminPaymentLoadPage.GIFT_FROM_UCHA);
        await expect(load.preview('Период на абонамента')).toContainText('1 месец');
        await expect(load.preview('Основание на плащането')).toContainText('с предплащане');
        activeUntil = (await load.preview('Активен до').innerText()).trim();
        expect(activeUntil).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });

      await test.step('"Зареди!" loads it onto the account', async () => {
        await load.load();
        await expect(load.successBox).toContainText('Успешно зареден акаунт');
        // The box shows even when the load failed inside — the account's data is what proves it.
        await expect(load.lastSubscription).toContainText('Подарък от Уча.се');
        await expect(load.lastSubscription).toContainText(`Абонамент за цялото съдържание до: ${activeUntil}`);
        await expect(load.history).toContainText('Подарък от Уча.се: зареждане на');
        await expect(load.history).toContainText('Статус: Успешно зареждане');
      });
    } finally {
      await context.close();
    }

    const [year, month, day] = activeUntil.split('-');
    await test.step('the account is subscribed until the previewed date', async () => {
      await profile.goto();
      await expect(profile.validUntil).toContainText(`${day}.${month}.${year}`);
    });

    await test.step('its payment history lists the gift', async () => {
      await profile.gotoPaymentHistory();
      await expect(profile.paymentHistory).toContainText('Подарък от Уча.се: абонамент за 1 месец');
      await expect(profile.paymentHistory).toContainText('Статус: Успешно зареждане');
    });
  });
});
