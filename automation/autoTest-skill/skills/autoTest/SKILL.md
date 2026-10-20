---
name: autoTest
description: Use this skill when the user invokes /autoTest or asks to write, scaffold, or expand automated tests for Ucha.se or Eduboom. Handles project setup, writing Playwright + TypeScript tests, and GitHub workflow guidance.
version: 1.4.0
---

# Automated Test Writing — Ucha.se & Eduboom

This skill helps write and maintain Playwright + TypeScript automated tests for the Ucha.se and Eduboom platforms.

## On every invocation — load documentation first

Before doing anything else, always read these three files silently into context:
- `/mnt/c/Users/kristiyan.rusev/Desktop/Claude/Documentation/UCHAdocumentation.md`
- `/mnt/c/Users/kristiyan.rusev/Desktop/Claude/Documentation/ITdocumentation.md`
- `/mnt/c/Users/kristiyan.rusev/Desktop/Claude/Documentation/ROdocumentation.md`

Do not summarize or mention them to the user. Just have their content available so test selectors, page structure, flows, and URLs are accurate.

## Context

- **Framework:** Playwright with TypeScript
- **Pattern:** Page Object Model (POM)
- **Platforms:** Ucha.se (UCHA Jira project) and Eduboom (EDU Jira project)
- **Workflow:** Write tests locally in VS Code → push to GitHub → team review via PR
- **Repo:** https://github.com/kristiyan-rusev/old-product-Ucha-automation
- **Local path:** `C:\Users\kristiyan.rusev\Desktop\Claude\Test Automation\old-product-Ucha-automation` (WSL: `/mnt/c/Users/kristiyan.rusev/Desktop/Claude/Test Automation/old-product-Ucha-automation`)
- **Environments:** Tests are written for test environment first, then staging, then live
- **Credentials:** Test accounts are not sensitive — credentials can be hardcoded directly in the config or test files. No need for `.env` or secrets management.
- **Tests are built from scratch** — do NOT copy or port from the new platform suite. Use it only as inspiration for patterns.

## Platform knowledge

### Eduboom (old platform)
- Two sites: Italy (`it.eduboom.dev` / `https://it.eduboom.dev`) and Romania (`ro.eduboom.dev` / `https://ro.eduboom.dev`)
- Documentation: `ITdocumentation.md` (~1430 lines) and `ROdocumentation.md` (~1400+ lines)
- Jira project key: `EDU`

### Ucha.se (old platform)
- Single Bulgarian site. Dev: `https://t.ucha.dev` | Staging: `https://staging.ucha.dev`
- Documentation: `UCHAdocumentation.md`
- Jira project key: `UCHA`
- Tech stack: PHP 8.3 / Twig / jQuery (server-rendered, NOT a SPA)
- Payment gateways: FIBank (card + recurring), EasyPay (cash), ePay.bg
- Admin at: `/admin/adminPanel.php` (requires 2FA via `/admin/access-verification`)
- QA tools at: `https://t.ucha.dev/set-data.php`

### Key differences from new platform
- No fingerprint-based auth — likely session cookies
- No Vue/React — server-rendered PHP/Twig/jQuery
- Different payment gateways (no Stripe)
- Ucha.se is Bulgarian-only (single project, no multi-country)
- Eduboom has IT and RO variants but is still the old platform architecture

## Reference — existing new platform test suite
Location: `C:\Users\kristiyan.rusev\Desktop\Claude\Test Automation\[New Prod]eduboom-automation\eduboom-qa-automation`

This is a mature Playwright suite for the **new** Eduboom platform. Do NOT copy tests from it. Use it as a reference for patterns only.

**Patterns worth borrowing:**
- POM hierarchy with a `basePage` extended by feature pages
- `utilsAPI` for seeding test state via API rather than UI
- `clearSession()` pattern to prevent state bleed between user personas
- Centralized `test-data/` for credentials and paths
- Setup fixture files for heavy state (subscriptions, campaigns) — run once, reused
- Soft assertions (`expect.soft()`) for collecting multiple failures in one run
- Annotating tests with metadata (email, grade, etc.) for traceability

**Do NOT port:**
- Stripe payment helpers → replace with FIBank/EasyPay/ePay.bg flows
- Fingerprint-based API auth → verify what old platforms use
- Multi-country Playwright projects → Ucha is single-site; Eduboom has IT/RO
- Campaign/lesson fixture logic → completely different on old platforms

## Playwright knowledge

The full official Playwright documentation (JS/TypeScript only, filtered from the multi-language source at `microsoft/playwright/docs/src`) is saved locally under `references/playwright-docs/` — 141 files, ~1.8MB, covering every guide and the complete API reference (Library API in `api/`, Test Runner API in `test-api/`, Reporter API in `test-reporter-api/`). This is the authoritative source — prefer it over recalling API details from memory, since method signatures and options are easy to misremember.

**Do not load all of it into context.** Start at `references/playwright-docs/INDEX.md` for the full file listing, then Read or grep only the specific file relevant to the task at hand — e.g. `references/playwright-docs/locators.md` for locator strategy, `references/playwright-docs/api/class-locatorassertions.md` for the exact assertion methods available on a locator, `references/playwright-docs/test-api/class-test.md` for `test.*` methods, `references/playwright-docs/test-configuration-js.md` for config options. Consult it whenever unsure of an exact method name, option, or behavior — don't guess.

The cheat sheet below covers what's needed for most day-to-day test writing without opening a file; go to the full reference for anything more specific (exact option names, edge-case behavior, less common APIs).

### Core test writing
- Tests use `test()` and `test.describe()` from `@playwright/test`
- Hooks: `beforeEach`, `afterEach`, `beforeAll`, `afterAll`
- Every test gets a fresh `BrowserContext` (isolated cookies, storage)
- Follow Arrange → Act → Assert structure

### Locators
Choosing selectors is the most important call when writing a test — follow **Choosing selectors** below. Full details: `references/playwright-docs/locators.md`, `references/playwright-docs/other-locators.md`, `references/playwright-docs/best-practices-js.md`.

### Assertions
- Auto-retrying (web-first): `toBeVisible()`, `toHaveText()`, `toHaveValue()`, `toBeChecked()`, `toBeDisabled()`, `toHaveAttribute()`, `toHaveURL()`, `toHaveTitle()`
- One-shot: `toBe()`, `toEqual()`, `toContain()`
- Soft assertions: `expect.soft()` — marks test failed but continues execution
- Custom timeout per assertion: `expect(locator).toBeVisible({ timeout: 10000 })`
- Full list: `references/playwright-docs/api/class-locatorassertions.md`, `class-pageassertions.md`, `class-apiresponseassertions.md`

### Actions
- `fill()` — clears and fills inputs
- `pressSequentially()` — types character by character
- `click()`, `dblclick()`, `rightClick()`
- `hover()`, `focus()`
- `selectOption()` — dropdowns
- `setChecked()` — checkboxes/radio
- `setInputFiles()` — file uploads
- `dragTo()` — drag and drop
- Playwright auto-waits for actionability before every action (visibility, enabled, stable, receives events) — see `references/playwright-docs/actionability.md`

### Navigation
- `page.goto(url)` — waits for load event
- `page.waitForURL()` — wait for specific URL after click
- `page.waitForLoadState('networkidle')` — wait for network quiet
- `page.waitForResponse()` — wait for specific API response
- Full details: `references/playwright-docs/navigations.md`

### Configuration (`playwright.config.ts`)
- `testDir`, `fullyParallel`, `retries`, `workers`, `reporter`, `timeout`, `expect.timeout`
- `use: { baseURL, storageState, screenshot, video, trace }`
- `projects` — separate configs per environment/browser
- `webServer` — spin up local server before tests
- Full details: `references/playwright-docs/test-configuration-js.md`, `references/playwright-docs/test-api/class-testconfig.md`, `class-testoptions.md`, `class-testproject.md`

### Authentication
- Best practice: authenticate once in a setup project, save with `page.context().storageState({ path })`
- Reuse via `storageState` in `playwright.config.ts` or `test.use()`
- For tests that modify server state: one account per worker using `testInfo.parallelIndex`
- Reset auth in specific tests: `test.use({ storageState: { cookies: [], origins: [] } })`
- Full details: `references/playwright-docs/auth.md`

### API testing
- `request` fixture for direct HTTP calls
- Use for seeding state before UI tests or validating state after
- Shares cookies with browser context if used via `page.request`
- Full details: `references/playwright-docs/api-testing-js.md`, `references/playwright-docs/api/class-apirequestcontext.md`

### Network
- `page.route()` / `context.route()` — intercept, mock, or modify requests
- `page.routeFromHAR()` — replay recorded traffic
- `waitForResponse()` — wait for specific API call
- Full details: `references/playwright-docs/network.md`, `references/playwright-docs/mock.md`, `references/playwright-docs/api/class-route.md`

### Page Object Model
- One class per page/component
- Locators as class properties
- Actions as methods
- Constructor takes `page: Page`
- Keep selectors in one place — easy to maintain
- Full details: `references/playwright-docs/pom.md`

### Fixtures
- `test.extend()` — create custom fixtures
- Test-scoped (default) vs worker-scoped (`{ scope: 'worker' }`)
- Auto fixtures (`{ auto: true }`) — run without being requested
- `mergeTests()` — combine fixtures from multiple files
- Full details: `references/playwright-docs/test-fixtures-js.md`, `references/playwright-docs/test-api/class-fixtures.md`

### Projects & parallelism
- `fullyParallel: true` — all tests in all files run in parallel
- `workers` — control concurrency
- `--shard=x/y` — split across machines
- `test.describe.configure({ mode: 'serial' })` — force sequential within a describe
- Full details: `references/playwright-docs/test-projects-js.md`, `references/playwright-docs/test-parallel-js.md`, `references/playwright-docs/test-sharding-js.md`

### Retries
- `retries: 1` on CI is a good baseline to reduce flakiness noise
- Detect retry in test: `testInfo.retry`
- Trace on first retry: `trace: 'on-first-retry'`
- Full details: `references/playwright-docs/test-retries-js.md`

### Timeouts
- Test timeout: 30s default — set globally or per test with `test.setTimeout()`
- Expect timeout: 5s default — set globally or per assertion
- `test.slow()` — triples the test timeout
- Full details: `references/playwright-docs/test-timeouts-js.md`

### Annotations & tags
- `test.skip()`, `test.fail()`, `test.fixme()`, `test.slow()`
- Tags in title: `test('login @smoke', ...)` — filter with `--grep @smoke`
- Custom annotations: `test.info().annotations.push({ type, description })`
- Full details: `references/playwright-docs/test-annotations-js.md`

### Debugging
- `--debug` flag — opens Playwright Inspector
- `--ui` flag — UI Mode with time-travel debugging
- `--headed` — see the browser
- Trace viewer: `npx playwright show-report`
- VS Code extension — breakpoints, locator picker, live debugging
- Full details: `references/playwright-docs/debug.md`, `references/playwright-docs/trace-viewer.md`, `references/playwright-docs/test-ui-mode-js.md`

### Reporters
- `html` — full report with traces
- `list` — terminal output
- `json` — machine-readable
- Multiple reporters: `reporter: [['list'], ['html']]`
- Full details: `references/playwright-docs/test-reporters-js.md`, `references/playwright-docs/test-reporter-api/`

### Frames (iframes)
- `page.frameLocator('.selector')` — interact inside iframe
- `page.frame({ name })` or `page.frame({ url })` — get Frame object directly
- Full details: `references/playwright-docs/frames.md`

### Dialogs
- Auto-dismissed by default
- Handle with `page.on('dialog', dialog => dialog.accept())`
- Must handle — otherwise action stalls
- Full details: `references/playwright-docs/dialogs.md`

### Emulation
- Viewport, locale, timezone, geolocation, color scheme, user agent
- Pre-configured devices via `playwright.devices['iPhone 13']`
- Full details: `references/playwright-docs/emulation.md`

### CI (GitHub Actions)
- Workflow file: `.github/workflows/playwright.yml`
- Steps: checkout → install Node → install deps → install browsers → run tests → upload report
- Use `--reporter=blob` for sharded runs, merge with `npx playwright merge-reports`
- Full details: `references/playwright-docs/ci.md`, `references/playwright-docs/ci-intro.md`

## Choosing selectors

Playwright's rule (`best-practices-js.md`, `locators.md`): prefer **user-facing attributes and
explicit test contracts** over DOM structure. A good locator survives a redesign, a CSS
refactor and (on Eduboom) a change of site language, and matches **exactly one** element.

### 1. Look at the real DOM first — never guess
The platform docs describe flows and URLs; they are often wrong about markup and even paths
(e.g. Eduboom RO tests live under `/teste/`, not the `/test/` the docs say). Before writing a
locator, open the page live (a short probe script, `npx playwright codegen <url>`, or the
"Pick locator" button in UI mode / the VS Code extension) and check:
- what the element really is (tag, role, accessible name, `id`, `name`, `data-*`),
- how many elements the candidate locator matches (`await loc.count()` must be 1),
- whether it is visible, or a hidden input behind a styled label/card.

### 2. Priority order
Pick the first option that is **stable and unique** for this element (examples show the
form, not real selectors — check the live page):

| # | Locator | Use when | Example |
|---|---------|----------|---------|
| 1 | `getByRole(role, { name })` | Interactive element with a proper role and a stable accessible name | `getByRole('button', { name: 'Вход' })` |
| 2 | `getByLabel()` | Form field with a real `<label for>` / `aria-label` | `getByLabel('Имейл')` |
| 3 | `getByPlaceholder()` | Input with no label but a placeholder | `getByPlaceholder('Парола')` |
| 4 | Test contract: `getByTestId()` / `[data-qa="…"]` | The dev team added a test attribute | `locator('[data-qa="select_payment_3"]')` |
| 5 | Stable, meaningful `id` | Hand-written ids that name the thing | `#subscribe-button`, `#turn-recurring-off` |
| 6 | Other stable attributes | `name`, `type`, `href`, `value`, domain `data-*` | `select[name="fail_reason"]`, `[data-id="10"]`, `a[href$="/profile/settings"]` |
| 7 | `getByText()` | Locating **non-interactive** content (messages, headings) | `getByText('Успешна промяна!')` |
| 8 | Semantic CSS class, scoped | Nothing above exists; the class names the purpose | `#wrap .voucher-error` |
| 9 | XPath | Practically never — only `xpath=..` to reach a parent when `filter({ has })` can't express it | |

### 3. Platform realities (Ucha.se & Eduboom)
These are server-rendered PHP/Twig/jQuery sites with little ARIA and no `data-testid`, so in
practice the suites lean on rows 4–6 — that's fine, as long as the attribute is stable:
- **Ids are usually the best contract here.** They are hand-written, language-neutral and
  rarely change. Avoid generated/positional ids (hashes, counters that differ per record)
  unless the number is the meaning (`#question-item-${n}`).
- **Ucha.se has `data-qa`** attributes on some elements — prefer them when present. If they
  become common, set `use: { testIdAttribute: 'data-qa' }` in the config and use `getByTestId()`.
- **Eduboom is multilingual (RO / IT).** A role/label/text locator with a hard-coded
  Romanian name breaks on IT. Either use a language-neutral attribute (id, `name`, `href`),
  or take the text from the per-site `test-data/messages.ts` (`siteMessages()`) — never
  hard-code one language inside a shared page object.
- **Ucha.se is Bulgarian only**, so `getByRole` with a Bulgarian name is fine — but the
  accessible name must be real (check it; many jQuery buttons are `<a>`/`<div>` with no role).
- **Hidden inputs:** radios/checkboxes are often visually hidden behind a styled card or
  label. Click the visible label/card (`label[for="…"]`, the plan card), assert on the
  input (`toBeChecked()`, `toHaveValue()`).
- **Iframes** (payment fields, players): `frameLocator()` / `locator.contentFrame()`.
- **A click that "does nothing" is usually not a selector problem** — these sites bind
  handlers late. Use `utils/retryClick` with an observable effect, don't change the locator.

### 4. Rules
- **Scope, then narrow.** Start from a stable container (a modal id, `#wrap`, a card) and
  narrow with `.filter({ hasText })`, `.filter({ has })` or chaining — instead of long CSS
  chains, e.g. `page.locator('.featured-card').filter({ has: page.locator('input[value="4"]') })`.
- **Exactly one match.** Don't silence strictness errors with `.first()` / `.nth()` /
  `.last()`. They're acceptable only when the duplicates are intentional or a known site bug
  — and then leave a one-line comment saying why (e.g. the duplicate
  `id="payment-help-details"` on `/pay_final.php`). Iterating a list by index is fine.
- **Short text needs `exact: true`** (`getByText('Да', { exact: true })`); use anchored
  regexes for partial matches (`/^\s*(Plată|Paga)\s*$/`).
- **Never** select by layout/styling classes (`.btn`, `.col-md-6`, `.mt-3`, `.d-flex`), by
  DOM position (`div > div:nth-child(3)`), or by auto-generated classes.
- **Text is for asserting, roles/attributes are for acting.** Locate the button by role or
  id; assert the message with `toHaveText` / `toContainText`.
- **Never compensate for a weak locator with `waitForTimeout`.** Use web-first assertions
  (`await expect(loc).toBeVisible()`) or wait for the effect.
- **Locators live in page objects** as `readonly` properties set in the constructor;
  parameterised ones are small methods (`fieldError(field)`, `packageCard(id)`). Specs
  don't contain raw selectors.
- **Comment what isn't obvious** — one line when a locator encodes a site quirk (hidden
  input, duplicate id, late-bound handler, IT vs RO difference).

## Phase 1 — Project scaffold (do this once, when repo is first created)

When the user shares their repo path, scaffold the following structure:

```
/
├── playwright.config.ts        # base config with projects: eduboom-it, eduboom-ro, ucha
├── .gitignore                  # node_modules, test-results, playwright-report, playwright/.auth
├── test-data/
│   └── credentials.ts          # hardcoded test account credentials (not sensitive)
├── package.json
├── tsconfig.json
├── pages/
│   ├── base/
│   │   └── BasePage.ts         # shared locators and helpers
│   ├── eduboom/
│   │   ├── LoginPage.ts
│   │   └── RegistrationPage.ts
│   └── ucha/
│       ├── LoginPage.ts
│       └── RegistrationPage.ts
├── utils/
│   └── helpers.ts              # shared utility functions
└── tests/
    ├── eduboom/
    │   ├── auth/
    │   │   ├── login.spec.ts
    │   │   └── registration.spec.ts
    │   └── ...
    └── ucha/
        ├── auth/
        │   ├── login.spec.ts
        │   └── registration.spec.ts
        └── ...
```

### Key config rules
- Credentials hardcoded in `test-data/credentials.ts` — no `.env` needed
- `playwright.config.ts` defines named projects per platform+environment
- All tests use `test.describe` blocks and follow Arrange → Act → Assert
- `retries: 1` on CI, `retries: 0` locally
- Trace on first retry: `trace: 'on-first-retry'`

## Phase 2 — Core functionality tests (build first)

Priority order for initial test coverage:

1. **Login** — valid credentials, invalid credentials, empty fields, forgot password link
2. **Registration** — valid flow, duplicate email, invalid email format, password validation
3. **Logout** — from various pages
4. **Password reset** — request email, follow link, reset password

Write these before expanding to feature-specific tests. Base selectors and flows on the platform documentation files loaded at the start of each invocation.

## Phase 3 — Story-based tests (future)

Once Phase 2 is stable, tests can be generated from Jira stories:
- Fetch the Jira story (same auth as `/testCase` skill)
- Identify testable user flows from the acceptance criteria
- Generate `.spec.ts` files following the established POM pattern
- Place files in the correct `tests/eduboom/` or `tests/ucha/` subdirectory

## Autonomous mode

When the user wants to leave a session running unattended for an extended stretch
(writing new tests, self-healing broken selectors, working through the backlog without
approving each step), this is **not** a `/loop` or `/schedule` job — it's a single
continuous session following `automation/OPERATING_PROCEDURE.md` in the project repo,
picking work from `automation/BACKLOG.md`, and logging any auto-applied fixes to
`automation/HEALING_LOG.md` (escalating anything unsafe to `automation/ATTENTION.md`
instead of guessing). Read that procedure file in full before starting — it has the
concrete rules (environment-down detection, how to tell a stale selector apart from the
site's own flow-state hiccups, when never to auto-fix). Requires the user to have set an
appropriate permission mode themselves so tool calls don't block on approval.

## GitHub workflow

When user is ready to push tests for review:
1. Create a feature branch: `git checkout -b test/[feature-name]`
2. Commit with descriptive messages: `git commit -m "test: add login tests for Eduboom"`
3. Push and open a PR — teammates review before merging to main

## How to use this skill

When invoked, ask the user:
1. **What do you want to work on?** (scaffold project / write new tests / expand existing tests / fix a test)
2. **Which platform?** (Ucha.se / Eduboom IT / Eduboom RO / all)
3. **What feature or flow?** (login, registration, etc.)

Then proceed based on the phase and context above. Always write clean, readable TypeScript that a teammate can understand and extend. Use the loaded platform documentation to understand flows, then confirm URLs and pick selectors from the live page (see **Choosing selectors**) — never guess at URLs or element structure.

## Notes for future updates
- Add confirmed base URLs for test/staging/live environments once user provides them
- Add GitHub repo URL once created
- Confirm API auth mechanism for old platforms (session cookies? tokens?) before building API helpers
- Confirm which Mailhog instance (if any) the old platforms use
- Add CI/CD section (GitHub Actions) when team is ready
- Expand Phase 3 with Jira integration once Phase 2 coverage is stable
