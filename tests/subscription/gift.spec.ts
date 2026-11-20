import { test, expect } from '../../utils/fixtures';
import { GiftPage } from '../../pages/GiftPage';
import { PromoPage } from '../../pages/PromoPage';
import { SubscriptionPage } from '../../pages/SubscriptionPage';
import { permanentAccount } from '../../utils/permanentAccount';
import { users } from '../../test-data/credentials';
import { logIn } from '../../utils/accounts';
import { fibankTestCard } from '../../test-data/fibank-test-card';

// Staging Checklist TC_C037 — "Купуване на подарък АБ".
test.describe('Gift subscription', () => {
  test('buying a gift by card gives the buyer a code (not a subscription), and the code activates 12 months for someone else', { tag: '@checklist' }, async ({
    browser,
  }, testInfo) => {
    test.setTimeout(240_000);

    // Buyer
    const buyerContext = await browser.newContext({ baseURL: testInfo.project.use.baseURL });
    const buyer = await buyerContext.newPage();
    await permanentAccount(buyer, testInfo, 'giftbuyer');
    const giftPage = new GiftPage(buyer);
    const codesBefore = await giftPage.giftCodes(); // the permanent buyer keeps the codes of earlier runs
    await giftPage.goto();
    await giftPage.startCardPurchase();
    await expect(buyer.locator('body')).toContainText('Закупуване на подарък - 12 месеца абонамент');
    await new SubscriptionPage(buyer).payWithCard(fibankTestCard);

    await expect(giftPage.successMessage).toContainText('Вие успешно закупихте подарък – абонамент за 12 месеца');
    await expect(giftPage.giftLink).toBeVisible();
    const code = await giftPage.readPurchasedGiftCode(codesBefore);
    expect(code).toMatch(/^\d{8}$/);
    // The buyer only gets the code — their own account stays without a subscription.
    await expect(buyer.locator('#wrap')).toContainText('Активирай абонамент сега');
    await buyerContext.close();

    // Recipient
    const recipientContext = await browser.newContext({ baseURL: testInfo.project.use.baseURL });
    const recipient = await recipientContext.newPage();
    await permanentAccount(recipient, testInfo, 'giftrcv');
    const promoPage = new PromoPage(recipient);
    await promoPage.goto();
    await promoPage.activate(code);

    await expect(promoPage.content).toContainText('Поздравления! Твоят абонамент е активиран!');
    await new SubscriptionPage(recipient).waitForActiveSubscription();
    await expect(recipient.locator('#wrap')).toContainText('Предплатен');
    await expect(recipient.locator('#wrap')).toContainText('Подарък от Уча.се: абонамент за подарък 12 месеца.');
    await expect(recipient.locator('#wrap')).toContainText('Успешно зареждане');
    await recipientContext.close();

    // A third person tries the same, already redeemed code
    const lateContext = await browser.newContext({ baseURL: testInfo.project.use.baseURL });
    const late = await lateContext.newPage();
    // The used code is refused and nothing changes, so the shared student (look-only) is enough.
    expect(await logIn(late, users.student.email, users.student.password)).toBe(true);
    const latePromo = new PromoPage(late);
    await latePromo.goto();
    await latePromo.activate(code);

    await expect(latePromo.error).toContainText('Този код за активация на абонамент вече е използван.');
    await expect(latePromo.error).toContainText('Продължи към избор на абонамент.');
    await expect(latePromo.content).not.toContainText('Твоят абонамент е активиран');
    await late.goto('/profile/subscription/');
    await expect(late.locator('#wrap')).toContainText('Активирай абонамент сега');
    await lateContext.close();
  });

  test('an unknown code is rejected on /promo', async ({ page }) => {
    test.setTimeout(90_000);
    expect(await logIn(page, users.student.email, users.student.password)).toBe(true); // nothing changes: the shared student
    const promoPage = new PromoPage(page);
    await promoPage.goto();

    await promoPage.activate('12345678');

    await expect(promoPage.error).toContainText('Този код за активация на абонамент не е въведен коректно');
    await page.goto('/profile/subscription/');
    await expect(page.locator('#wrap')).toContainText('Активирай абонамент сега');
  });
});
