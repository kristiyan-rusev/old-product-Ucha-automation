import * as fs from 'fs';
import * as path from 'path';

const LOG_PATH = path.join(__dirname, '..', 'test-data', 'created-accounts.log');

/**
 * test-data/created-accounts.log lists the test accounts that currently exist on dev: a line is
 * added when a test registers an account and removed when the account is deactivated. Whatever
 * is left in it is cleaned up by scripts/cleanup-accounts.ts.
 */
export function logCreatedAccount(email: string, project: string) {
  fs.appendFileSync(LOG_PATH, `${new Date().toISOString()}\t${project}\t${email}\n`);
}

/** Whether the log says an account on `email` exists on dev. */
export function isLogged(email: string): boolean {
  if (!fs.existsSync(LOG_PATH)) return false;
  const wanted = email.toLowerCase();
  return fs.readFileSync(LOG_PATH, 'utf-8').split('\n').some((line) => line.split('\t')[2]?.toLowerCase() === wanted);
}

/** Drops every line for `email` — called once the account has been deactivated. */
export function unlogAccount(email: string) {
  if (!fs.existsSync(LOG_PATH)) return;
  const wanted = email.toLowerCase();
  const kept = fs
    .readFileSync(LOG_PATH, 'utf-8')
    .split('\n')
    .filter((line) => line && line.split('\t')[2]?.toLowerCase() !== wanted);
  fs.writeFileSync(LOG_PATH, kept.join('\n') + (kept.length ? '\n' : ''));
}
