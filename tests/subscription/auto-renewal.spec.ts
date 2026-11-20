import { test, expect } from '../../utils/fixtures';
import { SubscriptionPage } from '../../pages/SubscriptionPage';
import { permanentAccount } from '../../utils/permanentAccount';
import { fibankTestCard } from '../../test-data/fibank-test-card';
import { clickWhenReady } from '../../utils/clickWhenReady';

// Staging/TC_C033 — "Изключи автоматично подновяване / Включи автоматично подновяване".
// Verified live 2026-10-07 / 2026-10-20.
test.describe('Auto-renewal (prepaid card subscription)', () => {
  test('turning auto-renewal off asks for confirmation, then turning it back on goes through FIBank', async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    await permanentAccount(page, testInfo, 'autorenew');
    const sub = new SubscriptionPage(page);
    await sub.goto();
    await sub.proceedToCheckout('card');
    await sub.payWithCard(fibankTestCard);
    await sub.waitForActiveSubscription();

    // On after a card purchase, with the card's last 4 digits.
    const wrap = page.locator('#wrap');
    await expect(wrap).toContainText('Автоматично подновяване на абонамент');
    await expect(wrap).toContainText(fibankTestCard.number.slice(-4));
    await expect(page.locator('#turn-recurring-off')).toBeVisible();

    // Off: settings page → confirmation dialog → "Да".
    await page.locator('#turn-recurring-off').click();
    await expect(page).toHaveURL(/\/profile\/recurring-off\/$/);
    // The dialog is in the DOM (hidden) from page load and the button's handler binds late —
    // wait for the dialog to actually show.
    const dialog = page.locator('#modal-recurring-off');
    await clickWhenReady(page.locator('#switch-off-button'), () => dialog.waitFor({ state: 'visible', timeout: 5000 }));
    await expect(dialog).toContainText('Можете да загубите подаръка си');
    await dialog.getByText('Да', { exact: true }).click();
    await expect(wrap).toContainText('Автоматичното подновяване на абонамента Ви е изключено.');

    await page.goto('/profile/subscription/');
    await expect(wrap).toContainText('Изключено');
    await expect(page.locator('#turn-recurring-off')).toHaveCount(0);

    // On again: "Включи" (late-bound handler) → FIBank card form, which only holds 0,01 € to
    // check the card → /payment/final/success "Успешна промяна!".
    await clickWhenReady(wrap.getByRole('button', { name: 'Включи', exact: true }), () =>
      page.waitForURL(/mdpay-test\.fibank\.bg/, { timeout: 15000 })
    );
    await expect(page.locator('body')).toContainText('Настройки на автоматично подновяване на абонамента');
    await sub.enableRecurringWithCard(fibankTestCard);
    await expect(wrap).toContainText('Успешна промяна!');
    await expect(wrap).toContainText('Автоматичното подновяване на абонамента Ви е включено.');
    await expect(wrap).toContainText(fibankTestCard.number.slice(-4));

    await page.goto('/profile/subscription/');
    await expect(page.locator('#turn-recurring-off')).toBeVisible();
    await expect(wrap).not.toContainText('Изключено');
  });
});
