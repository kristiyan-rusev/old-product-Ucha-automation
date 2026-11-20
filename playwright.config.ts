import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // No retries: a failure should be seen, not hidden by a second attempt (the user's choice).
  // Tests run one at a time — the dev server struggles under concurrent load.
  retries: 0,
  workers: process.env.CI ? 2 : 1,
  // durationReporter: how long each test took last, for automation/TEST_REVIEW.md (scripts/test-review.ts)
  reporter: [["list"], ["html", { open: "never" }], ["./utils/durationReporter.ts"]],

  use: {
    // SLOWMO=<ms> slows every action, to follow a headed run step by step; unset normally.
    launchOptions: { slowMo: Number(process.env.SLOWMO) || 0 },
    trace: "retain-on-failure",
    screenshot: "on",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "ucha-dev",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://t.ucha.dev",
      },
    },
    // Testing environment only for now (the user, 2026-10-29) — staging first needs checking: the
    // fixed code 111111, /set-data.php, sandbox payments and Mandrill (automation/CHECKLIST.md).
    // {
    //   name: "ucha-staging",
    //   use: {
    //     ...devices["Desktop Chrome"],
    //     baseURL: "https://staging.ucha.dev",
    //   },
    // },
    // {
    //   name: 'ucha-prod',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     baseURL: 'https://ucha.se',
    //   },
    // },
  ],
});
