import * as fs from 'fs';
import * as path from 'path';

/**
 * FIBank sandbox cards (test-data/fibank-test-card.ts): a card stops working after an unknown number of
 * payments (seen 2026-11-02/03: declined for the rest of the day, working again the next morning). So a
 * test process takes the next card in turn and keeps it for all its payments (tests compare the saved
 * card's last 4 digits), and a card FIBank declines when set-data simulates no failure is skipped for
 * 24 hours. Which card is next and which were declined: test-data/fibank-card-usage.json (local,
 * gitignored).
 */
const USAGE_PATH = path.join(__dirname, '..', 'test-data', 'fibank-card-usage.json');
const SKIP_MS = 24 * 60 * 60 * 1000;

export type FibankCard = { name: string; number: string; expiryMonth: string; expiryYear: string; cvc: string };
type Usage = { next: number; declined: Record<string, string> };

const last4 = (card: FibankCard) => card.number.slice(-4);

function readUsage(): Usage {
  if (!fs.existsSync(USAGE_PATH)) return { next: 0, declined: {} };
  const data = JSON.parse(fs.readFileSync(USAGE_PATH, 'utf-8'));
  return { next: data.next ?? 0, declined: data.declined ?? {} };
}

function writeUsage(data: Usage) {
  fs.writeFileSync(USAGE_PATH, JSON.stringify(data, null, 2));
}

function pick(cards: FibankCard[]): FibankCard {
  const data = readUsage();
  const declinedAt = (card: FibankCard) => Date.parse(data.declined[last4(card)] ?? '') || 0;
  for (let k = 0; k < cards.length; k++) {
    const i = (data.next + k) % cards.length;
    if (Date.now() - declinedAt(cards[i]) >= SKIP_MS) {
      data.next = (i + 1) % cards.length;
      writeUsage(data);
      return cards[i];
    }
  }
  // Every card was declined in the last 24 hours: try the one declined longest ago.
  return [...cards].sort((a, b) => declinedAt(a) - declinedAt(b))[0];
}

let chosen: FibankCard | undefined;
let simulated = false;

/** The card for this test process, chosen on first use (not when Playwright merely loads the spec). */
export function rotatingFibankCard(cards: FibankCard[]): FibankCard {
  const card = () => (chosen ??= pick(cards));
  return {
    get name() { return card().name; },
    get number() { return card().number; },
    get expiryMonth() { return card().expiryMonth; },
    get expiryYear() { return card().expiryYear; },
    get cvc() { return card().cvc; },
  };
}

/** set-data's FIBank simulation is on: a decline is expected, not a used-up card. */
export function setFibankFailureSimulated(on: boolean) {
  simulated = on;
}

/** FIBank declined a payment: unless set-data simulated it, skip this card for 24 hours and take another one. */
export function noteFibankDecline(card: FibankCard) {
  if (simulated) return;
  const data = readUsage();
  data.declined[last4(card)] = new Date().toISOString();
  writeUsage(data);
  chosen = undefined;
}
