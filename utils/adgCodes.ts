import * as fs from 'fs';
import * as path from 'path';

/**
 * Kindergarten (АДГ) codes: real, single-use and finite (150, given by the user — local and
 * gitignored in test-data/adg-codes.txt). Same idea as the MultiSport codes: claiming a code
 * records it as used at once, before we know whether the test passes, so a crashed or retried
 * run never tries a code that may already be spent. The codes were read from a screenshot —
 * a code the site refuses as unknown is recorded as rejected (probably a misread digit) and is
 * never handed out again.
 */
const CODES_PATH = path.join(__dirname, '..', 'test-data', 'adg-codes.txt');
const USED_PATH = path.join(__dirname, '..', 'test-data', 'adg-used-codes.json');

type Used = { used: string[]; rejected: string[] };

function readUsed(): Used {
  if (!fs.existsSync(USED_PATH)) return { used: [], rejected: [] };
  const data = JSON.parse(fs.readFileSync(USED_PATH, 'utf-8'));
  return { used: data.used ?? [], rejected: data.rejected ?? [] };
}

function writeUsed(data: Used) {
  fs.writeFileSync(USED_PATH, JSON.stringify(data, null, 2));
}

/** Claims the next code that is neither used nor rejected and records it as used. */
export function claimNextAdgCode(): string {
  const all = fs
    .readFileSync(CODES_PATH, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  const data = readUsed();
  const next = all.find((code) => !data.used.includes(code) && !data.rejected.includes(code));
  if (!next) throw new Error('No unused АДГ codes remain in test-data/adg-codes.txt.');
  data.used.push(next);
  writeUsed(data);
  return next;
}

/** The site refused the code as unknown: it moves from used to rejected. */
export function markAdgCodeRejected(code: string) {
  const data = readUsed();
  data.used = data.used.filter((c) => c !== code);
  if (!data.rejected.includes(code)) data.rejected.push(code);
  writeUsed(data);
}
