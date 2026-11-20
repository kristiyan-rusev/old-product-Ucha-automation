import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Remembers how long each test took the last time it ran, for automation/TEST_REVIEW.md
 * (scripts/test-review.ts). Local state, gitignored. A `--reporter=…` on the command line replaces
 * the config's reporters, so runs with one aren't recorded.
 */
const FILE = path.join(__dirname, '..', 'automation', 'test-durations.json');

type Run = { ms: number; status: string; date: string };

export default class DurationReporter implements Reporter {
  private runs: Record<string, Run> = {};

  printsToStdio() {
    return false;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'skipped') return;
    this.runs[test.id] = { ms: result.duration, status: result.status, date: new Date().toISOString().slice(0, 10) };
  }

  onEnd() {
    if (!Object.keys(this.runs).length) return;
    const all: Record<string, Run> = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf-8')) : {};
    fs.writeFileSync(FILE, JSON.stringify({ ...all, ...this.runs }, null, 2) + '\n');
  }
}
