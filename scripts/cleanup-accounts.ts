import 'dotenv/config';
import { chromium } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProfileSettingsPage } from '../pages/ProfileSettingsPage';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Bulk-deactivates the throwaway test accounts accumulated in test-data/created-accounts.log
 * (registration/password-reset/registration-confirmation tests each create one real account
 * per run and never clean it up themselves — this is that cleanup, run periodically instead
 * of per-test). Usage: npx tsx scripts/cleanup-accounts.ts
 *
 * A fresh browser context per account is required — reusing a single page across 30+
 * sequential login/deactivate cycles left it in a broken state (every subsequent field-fill
 * timed out) even though a brand-new browser worked fine immediately after, so whatever
 * accumulated was session-local, not the site actually blocking us.
 */

const BASE_URL = 'https://t.ucha.dev';
const LOG_PATH = path.join(__dirname, '..', 'test-data', 'created-accounts.log');
const CANDIDATE_PASSWORDS = ['TestPass123!', 'NewTestPass456!'];

interface LogEntry {
  raw: string;
  email: string;
}

function readEntries(): LogEntry[] {
  if (!fs.existsSync(LOG_PATH)) return [];
  const content = fs.readFileSync(LOG_PATH, 'utf-8').trim();
  if (!content) return [];
  return content.split('\n').map((line) => ({ raw: line, email: line.split('\t')[2] })).filter((e) => e.email);
}

/** Rewrites the log to keep only entries that had a genuine unexpected failure (worth retrying). */
function writeRemaining(entries: LogEntry[]) {
  const content = entries.map((e) => e.raw).join('\n');
  fs.writeFileSync(LOG_PATH, content ? content + '\n' : '');
}

async function main() {
  const entries = readEntries();
  const uniqueByEmail = new Map<string, LogEntry>();
  for (const e of entries) uniqueByEmail.set(e.email, e);
  const toProcess = [...uniqueByEmail.values()];

  console.log(`${toProcess.length} accounts to process.\n`);

  const browser = await chromium.launch({ headless: true });
  let deactivated = 0;
  let unreachable = 0;
  const failedEntries: LogEntry[] = [];

  for (const [i, entry] of toProcess.entries()) {
    console.log(`[${i + 1}/${toProcess.length}] ${entry.email}`);
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    const settingsPage = new ProfileSettingsPage(page);

    try {
      let workingPassword: string | null = null;
      for (const password of CANDIDATE_PASSWORDS) {
        await page.goto(`${BASE_URL}/login/`, { timeout: 15000 });
        await loginPage.login(entry.email, password);
        await page.waitForTimeout(1500);
        if (page.url() === `${BASE_URL}/`) {
          workingPassword = password;
          break;
        }
      }

      if (!workingPassword) {
        console.log('  unreachable — could not log in with any known password (already deactivated or unconfirmed)');
        unreachable++;
        continue;
      }

      await page.goto(`${BASE_URL}/profile/settings/`, { waitUntil: 'networkidle', timeout: 15000 });
      await settingsPage.startDeactivation();
      await settingsPage.verifyWithCode('111111');
      await settingsPage.submitReason(1);
      await settingsPage.confirmDeactivation(workingPassword);
      console.log('  deactivated');
      deactivated++;
    } catch (e) {
      console.log('  FAILED (kept in log for retry):', (e as Error).message.split('\n')[0]);
      failedEntries.push(entry);
    } finally {
      await context.close();
    }
  }

  writeRemaining(failedEntries);

  console.log(
    `\nDone. Deactivated: ${deactivated}, unreachable (removed from log): ${unreachable}, ` +
      `failed (kept for retry): ${failedEntries.length}, total: ${toProcess.length}`
  );
  await browser.close();
}

main().catch((e) => {
  console.error('FATAL ERROR:', e);
  process.exit(1);
});
