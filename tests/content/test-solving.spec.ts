import { test, expect } from '../../utils/fixtures';
import { TestSolvingPage } from '../../pages/TestSolvingPage';
import { permanentAccount } from '../../utils/permanentAccount';

// Staging Checklist row 29 / UCHAdocumentation §4.13 — a logged-in student takes a lesson test to the end.
// The free test of 6th-grade lesson 1 (15 questions: single choice, yes/no, multiple choice,
// fill-in-the-blank). The answer order is shuffled on every start, so answers are picked by text.
const testPath = '/testove/6161/delimost-nachalen-pregovor';
// The name a registered student gets (registerAccount); the result title greets the user by name.
const userName = 'QASubscription';

const correctAnswers: (string | string[])[] = [
  '540, 186, 15', // 1: multiples of 3 among 2135, 632, 540, 26, 15, 186
  'Не', // 2: 10 can't be a remainder of a division by 9
  ['7', '3', '6'], // 3: divisors of 126 (several correct)
  '2, 3, 6', // 4: common divisors of 24 and 42
  '8', // 5: GCD(64, 120)
  '1116', // 6: LCM(36, 124)
  '600', // 7: GCD(15, 40) · LCM(15, 40) = 5 · 120
  '105', // 8: smallest odd three-digit multiple of 3
  'Не', // 9: 125 + 572 = 697
  '2', // 10: primes among 17, 25, 38, 47, 57, 63
  '3', // 11: 135* divisible by 3, not by 2
  ['131 + 17 не се дели на 2', '16.47 не се дели на 2'], // 12: the wrong statements
  '4', // 13: 437* divisible by 2 and 3, not by 5 (blank)
  '8', // 14: GCD(56, 40, 64) (blank)
  '4570', // 15: smallest four-digit number from 0, 4, 5, 7 divisible by 2 and 5 (blank)
];

// The five grade titles of the result page (§4.13).
const gradeTitles = [
  `Случва се, ${userName}. Гледай видео урока и опитай пак!`,
  `На косъм... ${userName}, можеш повече`,
  `На прав път си, ${userName}! Можеш и още по-добре!`,
  `Доста добре, ${userName}! Дай още малко!`,
  `Браво, ${userName}! Ти си машина!`,
];

test.describe('Solving a test', () => {
  test('a student answers every question of a test and sees the result', { tag: '@checklist' }, async ({ page }, testInfo) => {
    test.setTimeout(300_000);
    // Lesson 1's test is free and nothing asserts earlier results, so the permanent account needs no reset.
    await permanentAccount(page, testInfo, 'solvetest', { reset: false });
    const solving = new TestSolvingPage(page);

    await test.step('open the test and start it', async () => {
      await solving.goto(testPath);
      await expect(solving.startTestButton).toBeVisible();
      await solving.startTest();
      await expect(solving.activeQuestionNav).toHaveAttribute('id', 'question-item-link-1');
    });

    await test.step('answer all 15 questions and hand the test in', async () => {
      await solving.solve(correctAnswers);
    });

    await test.step('the result page shows the grade and one of the grade titles', async () => {
      await expect(page).toHaveURL(/\/testove\/6161\/delimost-nachalen-pregovor\/\d+\/summary$/);
      await expect(solving.rating).toHaveText(/^\d\.\d{2}$/);
      await expect(solving.ratingLabel).not.toBeEmpty();
      const title = (await solving.resultMessage.innerText()).trim();
      expect(gradeTitles).toContain(title);
    });
  });
});
