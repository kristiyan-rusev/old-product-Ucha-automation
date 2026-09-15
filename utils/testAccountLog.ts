import * as fs from 'fs';
import * as path from 'path';

const LOG_PATH = path.join(__dirname, '..', 'test-data', 'created-accounts.log');

/** Appends a record of a real account created by a test — so accumulation across runs is traceable. */
export function logCreatedAccount(email: string, project: string) {
  const line = `${new Date().toISOString()}\t${project}\t${email}\n`;
  fs.appendFileSync(LOG_PATH, line);
}
