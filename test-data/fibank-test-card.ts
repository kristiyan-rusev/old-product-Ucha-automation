import { FibankCard, rotatingFibankCard } from '../utils/fibankCards';

/**
 * FIBank's test/sandbox cards for successful payments (mdpay-test.fibank.bg; Confluence "Useful
 * information - Data and test cases hints", UCHA space) — not live financial instruments, for QA
 * on dev only. Charges through this gateway are a symbolic 0.01 EUR regardless of the plan's real
 * price; the cardholder name is free text. Each card stops working after an unknown number of
 * payments, so tests take them in turn (utils/fibankCards.ts).
 */
export const fibankTestCards: FibankCard[] = [
  { name: 'KrisRs Rusev', number: '4378502747190388', expiryMonth: '11', expiryYear: '30', cvc: '477' },
  { name: 'KrisRs Rusev', number: '4378512749474136', expiryMonth: '08', expiryYear: '30', cvc: '266' },
  { name: 'KrisRs Rusev', number: '5169752746494709', expiryMonth: '08', expiryYear: '30', cvc: '036' },
  { name: 'KrisRs Rusev', number: '5169752744745219', expiryMonth: '08', expiryYear: '30', cvc: '805' },
];

/** The card this test process pays with — the same one for all its payments. */
export const fibankTestCard = rotatingFibankCard(fibankTestCards);
