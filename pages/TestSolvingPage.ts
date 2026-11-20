import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { clickWhenReady } from '../utils/clickWhenReady';

/**
 * Solving a lesson test (/testove/{id}/{slug}) and its result page (…/{attemptId}/summary).
 * Verified live 2026-10-28 with a fresh student on /testove/6161 (15 questions, 30 min):
 * - "Започни теста" loads the questions into the same page (no navigation). Questions are
 *   `#question-item-N`; the answer order is shuffled on every start, so answers are chosen by their
 *   text. Radio / checkbox answers are `label.custom-control-label`, fill-in-the-blank questions
 *   have one `input[type=text]`. Later questions stay locked until the earlier ones are checked.
 * - One footer button at a time: "Напред" (#question-check-user-answer, greyed with class `disabled`
 *   until an answer is given) checks the answer and shows the verdict; then "Следващ въпрос"
 *   (#question-next); on the last question "Предай" (#question-submit) replaces "Следващ въпрос".
 * - Submitting goes to …/summary: a grade title (#result-message), the grade and the review.
 */
export class TestSolvingPage extends BasePage {
  readonly startTestButton: Locator;
  readonly checkAnswerButton: Locator;
  readonly nextQuestionButton: Locator;
  readonly submitButton: Locator;
  readonly activeQuestionNav: Locator;
  // Result page
  readonly resultMessage: Locator;
  readonly ratingLabel: Locator;
  readonly rating: Locator;

  constructor(page: Page) {
    super(page);

    // "Започни теста" above the question preview (#start-exercise-down is its copy below it).
    this.startTestButton = page.locator('#start-exercise');
    this.checkAnswerButton = page.locator('#question-check-user-answer');
    this.nextQuestionButton = page.locator('#question-next');
    this.submitButton = page.locator('#question-submit');
    this.activeQuestionNav = page.locator('#question-nav a.active');

    this.resultMessage = page.locator('#result-message');
    this.ratingLabel = page.locator('#user-rating-label');
    this.rating = page.locator('#user-rating');
  }

  question(n: number): Locator {
    return this.page.locator(`#question-item-${n}`);
  }

  /** Clicks "Започни теста" and waits for the questions to load into the same page. */
  async startTest() {
    await clickWhenReady(this.startTestButton, () =>
      this.page.waitForResponse((r) => r.url().includes('/load-questions') && r.ok())
    );
    await expect(this.question(1)).toBeVisible();
  }

  /** Ticks the option(s) with exactly this text (radio or checkbox), or types into the blank if the question has one. */
  async answer(n: number, answer: string | string[]) {
    const question = this.question(n);
    const blank = question.locator('input[type="text"]');
    // Single-choice questions take a string too, so the blank is told apart by being on the page
    // (count() doesn't wait, which is fine: callers have already seen the question).
    if (typeof answer === 'string' && (await blank.count()) > 0) {
      await blank.fill(answer);
      return;
    }
    for (const text of typeof answer === 'string' ? [answer] : answer) {
      await question.locator('label.custom-control-label').filter({ hasText: exactText(text) }).click();
    }
  }

  /** "Напред": checks the answer given so far and waits for the verdict (the next button shows). */
  async checkAnswer() {
    await expect(this.checkAnswerButton).not.toHaveClass(/disabled/);
    await clickWhenReady(this.checkAnswerButton, () => this.nextQuestionButton.waitFor({ state: 'visible' }));
  }

  /** "Следващ въпрос": goes on to question `n + 1` and waits for it to be the active one. */
  async goToNextQuestion(n: number) {
    await this.nextQuestionButton.click();
    await expect(this.activeQuestionNav).toHaveAttribute('id', `question-item-link-${n + 1}`);
  }

  /** Answers question `n`, checks it and goes on to the next question. */
  async answerAndContinue(n: number, answer: string | string[]) {
    await this.answer(n, answer);
    await this.checkAnswer();
    await this.goToNextQuestion(n);
  }

  /** Answers the last question and hands the test in; waits for the result page. */
  async answerAndSubmit(n: number, answer: string | string[]) {
    await this.answer(n, answer);
    await expect(this.checkAnswerButton).not.toHaveClass(/disabled/);
    await clickWhenReady(this.checkAnswerButton, () => this.submitButton.waitFor({ state: 'visible' }));
    await this.submitButton.click();
    await this.page.waitForURL(/\/summary$/);
  }

  /** Solves a whole test from `answers` (index 0 = question 1) and lands on the result page. */
  async solve(answers: (string | string[])[]) {
    for (let i = 0; i < answers.length - 1; i++) await this.answerAndContinue(i + 1, answers[i]);
    await this.answerAndSubmit(answers.length, answers[answers.length - 1]);
  }
}

function exactText(text: string): RegExp {
  return new RegExp(`^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
}
