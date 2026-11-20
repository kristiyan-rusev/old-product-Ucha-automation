import { test, expect } from '../../utils/fixtures';
import { SubscriptionPage } from '../../pages/SubscriptionPage';
import { AdminAccessPage } from '../../pages/AdminAccessPage';
import { AdminUserManagementPage } from '../../pages/AdminUserManagementPage';
import { permanentAccount } from '../../utils/permanentAccount';
import { fibankTestCard } from '../../test-data/fibank-test-card';

// Admin → "Управление на потребители" → "Плащания" for the test's own account, opened straight by the user id (no
// search). Look only: the admin only opens the page and its tabs. Checked live 2026-11-05: an ordinary card purchase
// (12 months prepaid; the student's own /profile/subscription/ page shows auto-renewal "Включено") shows in "Всички плащания" with "Автоматично плащане" = "Не" —
// the column marks payments made BY an automatic mechanism (renewal / saved card / instalment), not the first purchase —
// and the "Автоматично плащане (рекъринг)" tab is a log of on/off operations, so it is empty for a new purchase.
test.describe('Admin — a test account\'s payments in "Управление на потребители"', () => {
  test('the admin sees the 12-month card purchase on the account\'s "Плащания" page', { tag: '@story' }, async ({ page, browser }, testInfo) => {
    test.setTimeout(900_000);
    await permanentAccount(page, testInfo, 'adminpay');
    const userId = await AdminUserManagementPage.ownUserId(page.context());

    await test.step('the student buys 12 months prepaid by card', async () => {
      const subscription = new SubscriptionPage(page);
      await subscription.goto();
      await subscription.proceedToCheckout('card');
      await subscription.payWithCard(fibankTestCard);
      await expect(page).toHaveURL(/\/payment\/final\/success/);
      await subscription.waitForActiveSubscription();
    });

    // The admin works in a second browser context, so the student stays logged in.
    const adminContext = await browser.newContext();
    try {
      const adminPage = await adminContext.newPage();
      const adminAccess = new AdminAccessPage(adminPage);
      const userManagement = new AdminUserManagementPage(adminPage);

      await test.step('the QA admin logs in and passes 2FA', async () => {
        await adminAccess.logIn(process.env.UCHA_ADMIN_EMAIL!, process.env.UCHA_ADMIN_PASSWORD!);
        await adminAccess.gotoAccessVerification();
        await adminAccess.confirmWithCode('111111');
        await expect(adminPage).toHaveURL(/\/admin\/adminPanel\.php$/);
      });

      await test.step('the account\'s "Плащания" page lists the purchase', async () => {
        await userManagement.gotoPayments(userId);
        await expect(adminPage).toHaveTitle('Управление на потребители');
        await expect(userManagement.allPaymentsPanel.getByRole('heading', { name: 'Информация за поръчки' })).toBeVisible({ timeout: 60_000 });
        await expect(userManagement.headers(userManagement.allPaymentsPanel)).toHaveText([
          'Поръчка', 'Тип', 'Пакет', 'Изтеглена сума', 'Начин на плащане', 'Автоматично плащане',
          'Дата на поръчката', 'Дата на плащане', 'Статус', 'Управление',
        ]);

        const orders = userManagement.rows(userManagement.allPaymentsPanel);
        await expect(orders).toHaveCount(1);
        await expect(orders.locator('td')).toHaveText([
          /^\d+$/, // the order number
          'Абонамент',
          '12 месеца',
          /\d+,\d{2}\s*€/, // the amount charged, in euro (and levs)
          /^Плащане чрез карта/, // followed by the Fibank transaction id
          'Не',
          /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
          /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
          'Успешно плащане',
          'Преглед',
        ]);
      });

      await test.step('"Автоматично плащане (рекъринг)" is a log of on/off operations — none yet for a new purchase', async () => {
        await userManagement.openRecurringTab();
        await expect(userManagement.recurringPanel.getByRole('heading', { name: 'Операции по включване/изключване на автоматично плащане (рекъринг)' })).toBeVisible();
        await expect(userManagement.headers(userManagement.recurringPanel)).toHaveText([
          'Операция', 'Поръчка, използвана за операцията', 'Пакет', 'Статус', 'Fibank Transaction ID', 'Дата',
        ]);
        await expect(userManagement.rows(userManagement.recurringPanel)).toHaveCount(0);
      });

      await test.step('"Абонаменти на вноски" is empty — the purchase is not a monthly plan', async () => {
        await userManagement.openContractsTab();
        await expect(userManagement.contractsPanel.getByRole('heading', { name: 'Абонаменти на вноски' })).toBeVisible();
        await expect(userManagement.rows(userManagement.contractsPanel)).toHaveCount(0);
      });
    } finally {
      await adminContext.close();
    }
  });
});
