You are running UNATTENDED as cycle {{CYCLE}} of an overnight test-building run for the
Ucha.se Playwright suite (started by `automation/night/night-run.sh`). Nobody is watching and
nobody will answer — never ask questions or wait for confirmation. When unsure, take the safe
option the rules give you, or write a note to `automation/ATTENTION.md` and move on.

## What to do

Load the `test-automation:autoTest` skill and follow its "Autonomous mode":
`automation/OPERATING_PROCEDURE.md` (read it in full) working through `automation/BACKLOG.md`.
Also read `automation/AGENT_RULES.md` — it applies to you and to every agent you start.

Overrides for night runs:
- Do exactly ONE cycle of the procedure ("One cycle", steps 1–4), then stop. Ignore step 5,
  step 6 and the "Stopping" section — the runner handles time, repeats and cleanup.
- From the skill's "load documentation first" step, read only `UCHAdocumentation.md`, and only
  the sections relevant to the item (grep its headings first). Skip the Eduboom docs.
- Skip the skill's "How to use this skill" questions — the procedure decides the work.
- Regression check = the spec you worked on + `npx playwright test tests/auth --project=ucha-dev --grep-invert @story`
  (the `@story` tests take ~10 min; run them only when your change touches what they cover).
  Never run the whole suite.
- If `git status` shows work left over by an earlier cycle that was cut off, deal with it first
  as the procedure's "Before starting" section says.

## Shell commands

Follow "Shell commands" in `AGENT_RULES.md`: never `cd`, no `$(…)` or heredocs, commit with
`git commit -m … -m …`, and a refused command means simplify it, not stop. Only if a plain,
standalone `npx playwright test …` or `git commit -m …` is refused, end the cycle as `blocked`.

## Conditions tonight

- Email for fresh accounts (read from Mandrill, `utils/mandrill.ts`): **{{EMAIL_STATUS}}**. If it is
  not OK: tests that read emails (the `@story` tests, anything using
  `utils/registerAndLogin.ts`) fail. That is the environment, not a regression — don't heal
  them and don't let them block new work. Pick only backlog items that work with the shared
  student or a guest; if every remaining item needs a fresh account, end the cycle as `blocked`.
- About {{MINUTES_LEFT}} minutes are left in the night, and this cycle is cut off after
  {{CYCLE_MINUTES}} minutes. If an item is too big, finish and commit a meaningful part and
  write what's left into that item's backlog text.

## Feeding the Backlog Scout

- Only `- [ ]` items are work; `- [?]` lines are proposals waiting for the user — skip them.
- If no `- [ ]` item can be done tonight, end the cycle as `nothing-to-do` — the runner then
  asks the Backlog Scout to add some.
- When you tick an item off, add what you saw but didn't cover as a `Not covered: …` remark
  in that item (and anything surprising about the site to `ATTENTION.md`) — the Scout turns
  those into new items.

## Use the agents (they keep your own context small)

- **Explore before writing code:** start `playwright-test-planner` with the backlog item and a
  seed — `tests/seed.spec.ts` (logged-in shared student) or `tests/seed-guest.spec.ts` (guest).
  If the flow needs a fresh account or a purchase, tell it so; it explores what it can and
  lists the rest. Its plan is saved in `specs/`.
- **Write the page objects and the spec yourself** (the Generator can't edit page objects). You
  may ask `playwright-test-generator` for a first draft of one scenario, then move its
  selectors into `pages/`.
- **A failing test** (new or regression): start `playwright-test-healer` with only that test.
- **Commit messages** end with the line `Night-Run: {{STAMP}} cycle {{CYCLE}}`, so night commits
  are easy to find in the morning (`git log --grep Night-Run`).
- **Before every commit:** stage the files, start `ucha-test-reviewer`, fix every MUST it
  reports, then commit. If it still says CHANGES after two rounds, don't commit — `git restore`
  the change, note it in `ATTENTION.md`, and end the cycle as `blocked`.

## At the end

1. Append one line to `{{REPORT}}` under `## Cycles` (take the time from `date +%H:%M`):
   `- #{{CYCLE}} HH:MM <status> — <backlog item>, <what you did>, <commit sha(s)>, <anything the human must look at>`
2. End your final message with exactly one line:
   `CYCLE_RESULT: <built|partial|healed|env-down|nothing-to-do|blocked> — <one-line summary>`
