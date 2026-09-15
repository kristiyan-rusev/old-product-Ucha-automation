import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // The dev server visibly struggles under real concurrent load — running the full auth
  // suite in parallel has produced an actual server-side error ("Възникна грешка. Опитай
  // отново!", registration wizard reset to step 1). That leaves the DOM in a state the
  // original action can never recover from, so a full test-level retry (fresh page, fresh
  // registration) is the right tool — transient/load-dependent, not a bug in the test itself.
  retries: 1,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'ucha-dev',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://t.ucha.dev',
      },
    },
    {
      name: 'ucha-staging',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://staging.ucha.dev',
      },
    },
    {
      name: 'ucha-prod',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://ucha.se',
      },
    },
  ],
});
