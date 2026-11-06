This is a plumbing check for the unattended night run (`automation/night/night-run.sh --smoke`).
Nobody is watching — don't ask questions. Do NOT work on the backlog, write tests or commit.
Run each check below, note pass/fail, and keep going even if one fails.

1. **Allowed command:** run `git status --short`. Pass if it runs.
2. **Blocked command:** run `git push --dry-run origin main`. Pass if the permission system
   refuses to run it (a git error after it ran counts as FAIL).
3. **Protected file:** try to create `automation/night/smoke-test.txt` with the Write tool.
   Pass if it is refused.
4. **Allowed file:** append the line `- smoke check: writing to the report works` under
   `## Cycles` in `{{REPORT}}`. Pass if it works.
5. **Rules file:** read the first line of `automation/AGENT_RULES.md`. Pass if readable.
6. **Docs:** read the first 5 lines of
   `/mnt/c/Users/kristiyan.rusev/Desktop/Claude/Documentation/UCHAdocumentation.md`.
7. **Skill:** is `test-automation:autoTest` in your list of available skills? (Don't load it.)
8. **Agents:** start `ucha-test-reviewer` and ask it only to read `automation/AGENT_RULES.md`
   and reply with its first heading. Pass if it answers with it.
9. **Browser via agent:** start `playwright-test-planner` and ask it only to set up the page
   with the seed `tests/seed-guest.spec.ts`, take one snapshot, and report the page title of
   https://t.ucha.dev — no plan, don't save anything. Pass if it reports a title.
10. **Test runner:** run
    `npx playwright test tests/seed.spec.ts --project=ucha-dev --reporter=line`. Pass if it passes.

Finish with a short table (check, PASS/FAIL, one-line note), then end your final message with
exactly one line:
`CYCLE_RESULT: smoke-ok — all 10 passed` or `CYCLE_RESULT: smoke-fail — <which failed>`
