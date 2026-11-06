import 'dotenv/config';
import { chromium } from '@playwright/test';
import { deactivateIfExists, TEST_PASSWORDS } from '../utils/accounts';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Deactivates leftover test accounts on t.ucha.dev: everything in test-data/created-accounts.log,
 * plus any addresses passed on the command line.
 *
 *   npx tsx scripts/cleanup-accounts.ts                        # the log
 *   npx tsx scripts/cleanup-accounts.ts --only a@x,b@x --password 'Testparola*'
 *
 * For each account: log in with the known test passwords → profile settings → deactivate (SMS
 * code 111111 on dev). An account that can't log in may simply never have been activated — then
 * its activation email is looked up in Mandrill (up to 30 days back), the account is activated
 * and deactivated right after. Accounts that still can't be reached (already deactivated, or
 * their email is gone) are dropped from the log; real failures stay in it for the next run.
 *
 * A fresh browser context per account: reusing one page across dozens of login/deactivate
 * cycles left it in a broken state (every later field-fill timed out).
 */

const BASE_URL = 'https://t.ucha.dev';
const LOG_PATH = path.join(__dirname, '..', 'test-data', 'created-accounts.log');

type Entry = { raw: string; email: string };
type Outcome = 'deactivated' | 'activated+deactivated' | 'unreachable' | 'blocked-monthly-plan' | 'failed';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
}

function readLog(): Entry[] {
  if (!fs.existsSync(LOG_PATH)) return [];
  return fs
    .readFileSync(LOG_PATH, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map((raw) => ({ raw, email: raw.split('\t')[2] }))
    .filter((e) => e.email);
}

async function main() {
  const only = arg('--only');
  const passwords = arg('--password') ? [arg('--password')!, ...TEST_PASSWORDS] : TEST_PASSWORDS;
  const fromLog = !only;
  const entries: Entry[] = only ? only.split(',').map((email) => ({ raw: '', email: email.trim() })) : readLog();
  const unique = [...new Map(entries.map((e) => [e.email.toLowerCase(), e])).values()];
  console.log(`${unique.length} accounts to process.\n`);

  const browser = await chromium.launch({ headless: true });
  const counts: Record<Outcome, number> = { deactivated: 0, 'activated+deactivated': 0, unreachable: 0, 'blocked-monthly-plan': 0, failed: 0 };
  const failed: Entry[] = [];

  // A few accounts at a time (--parallel N, default 3), each in its own browser context.
  const parallel = Number(arg('--parallel') ?? 3);
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < unique.length) {
      const entry = unique[next++];
      const context = await browser.newContext({ baseURL: BASE_URL });
      const page = await context.newPage();
      let outcome: Outcome;
      try {
        const result = await deactivateIfExists(page, entry.email, passwords);
        outcome = result === 'not-found' ? 'unreachable' : result;
        // The site won't deactivate an account that pays monthly — keep it in the log for an admin.
        if (outcome === 'blocked-monthly-plan') failed.push(entry);
      } catch (e) {
        outcome = 'failed';
        failed.push(entry);
        console.log(`  error (${entry.email}): ${(e as Error).message.split('\n')[0]}`);
      } finally {
        await context.close();
      }
      counts[outcome!]++;
      console.log(`[${++done}/${unique.length}] ${outcome!.padEnd(21)} ${entry.email}`);
    }
  };
  await Promise.all(Array.from({ length: parallel }, worker));
  await browser.close();

  // Only real failures stay in the log, for the next run — plus anything tests added to the
  // log while this was running (re-read now, so those aren't lost).
  if (fromLog) {
    const processed = new Set(unique.map((e) => e.email.toLowerCase()));
    const failedSet = new Set(failed.map((e) => e.email.toLowerCase()));
    const keep = readLog().filter((e) => !processed.has(e.email.toLowerCase()) || failedSet.has(e.email.toLowerCase()));
    fs.writeFileSync(LOG_PATH, keep.map((e) => e.raw).join('\n') + (keep.length ? '\n' : ''));
  }
  console.log(`\nDone: ${JSON.stringify(counts)}`);
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
