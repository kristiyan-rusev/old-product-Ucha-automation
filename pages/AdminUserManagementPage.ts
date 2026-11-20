import { BrowserContext, Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { clickWhenReady } from '../utils/clickWhenReady';

/**
 * Admin → "Управление на потребители" for one user, straight at /admin/user-management/<id>/payments (no user
 * search). Its "Плащания" page has three tabs: "Всички плащания" (the orders), "Автоматично плащане (рекъринг)"
 * (a log of auto-renewal on/off operations) and "Абонаменти на вноски" (monthly plans). Looking only — nothing
 * on the page is clicked except the tabs. The page is heavy on dev (it can take over a minute to load).
 */
export class AdminUserManagementPage extends BasePage {
  readonly allPaymentsTab: Locator;
  readonly recurringTab: Locator;
  readonly contractsTab: Locator;
  readonly allPaymentsPanel: Locator;
  readonly recurringPanel: Locator;
  readonly contractsPanel: Locator;

  constructor(page: Page) {
    super(page);

    this.allPaymentsTab = page.getByRole('tab', { name: 'Всички плащания' });
    this.recurringTab = page.getByRole('tab', { name: 'Автоматично плащане (рекъринг)' });
    this.contractsTab = page.getByRole('tab', { name: 'Абонаменти на вноски' });
    this.allPaymentsPanel = page.locator('#payments-tab');
    this.recurringPanel = page.locator('#recurring-tab');
    this.contractsPanel = page.locator('#contracts-tab');
  }

  /**
   * The id of the account the page is logged in as. The site keeps a `user_device_<id>` cookie for it —
   * the only place the id shows up without the admin's user search.
   */
  static async ownUserId(context: BrowserContext): Promise<number> {
    const cookies = await context.cookies();
    for (const { name } of cookies) {
      const match = /^user_device_(\d+)$/.exec(name);
      if (match) return Number(match[1]);
    }
    throw new Error('No user_device_<id> cookie — the account is not logged in');
  }

  /** Opens the user's "Плащания" page. Waits only for the HTML: the page's other requests can take minutes. */
  async gotoPayments(userId: number) {
    await this.page.goto(`/admin/user-management/${userId}/payments`, { timeout: 300_000, waitUntil: 'domcontentloaded' });
  }

  /** Bootstrap tabs: the click only works once the page's handlers are bound. */
  async openRecurringTab() {
    await clickWhenReady(this.recurringTab, () => this.recurringPanel.waitFor({ state: 'visible', timeout: 10_000 }));
  }

  async openContractsTab() {
    await clickWhenReady(this.contractsTab, () => this.contractsPanel.waitFor({ state: 'visible', timeout: 10_000 }));
  }

  /** The rows of a panel's table (header row excluded), each as a locator. */
  rows(panel: Locator): Locator {
    return panel.locator('tr').filter({ has: this.page.locator('td') });
  }

  /** The header cells' texts of the panel's table. */
  headers(panel: Locator): Locator {
    return panel.locator('th');
  }
}
