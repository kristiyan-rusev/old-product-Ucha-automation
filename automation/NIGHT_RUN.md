# Night run — building tests unattended

`automation/night/night-run.sh` keeps working through `BACKLOG.md` on its own (overnight, for
example) and leaves a report for the morning. Nothing is pushed; you review everything first.

## How it works

The runner repeats **cycles** until the stop time (default 07:00), until nothing is left that
can be done unattended, or until 25 cycles. Each cycle is a **fresh** background Claude
session that does exactly one round of `OPERATING_PROCEDURE.md` with the autoTest skill:

1. checks that t.ucha.dev is up (if not, the runner waits — up to 2 hours),
2. runs `tests/auth` to make sure the suite is green,
3. takes the next backlog item; the **Planner** agent explores the pages,
4. writes the page objects and the test, runs it; the **Healer** agent handles failures,
5. the **Reviewer** agent checks the change against `AGENT_RULES.md` before it's committed,
6. commits locally, ticks the item off, adds a line to tonight's report.

A fresh session per cycle means a crash or a stuck cycle only loses that cycle, and the
session never runs out of context. What carries over between cycles is in files: the
backlog, `HEALING_LOG.md`, `ATTENTION.md` and the git history.

## Once, before the first night

1. **Email access (Mandrill)** — almost every backlog item registers a fresh account, which
   needs the activation email. t.ucha.dev sends every email through Mandrill, and tests read
   them there (`utils/mandrill.ts`): no inbox, nothing expires. Needs `MANDRILL_API_KEY` in
   `.env` (never committed). The key can see other people's emails too, so the code only ever
   searches one exact test address, and night sessions can't read `.env`.
   Check: `npx tsx scripts/check-mandrill.ts` → `OK mandrill …`.
2. **Plumbing check** (5 min, no work done):
   `automation/night/night-run.sh --smoke` → the report must say `smoke-ok`.
3. **Trial** while you're around — one real cycle with a visible browser so you can watch the
   Planner explore: `automation/night/night-run.sh --trial`.

## Every night

**Just tell Claude**, in any Claude Code conversation:

| You say | What happens |
|---|---|
| "Work on the backlog on your own tonight" (optionally "until 6", "just 3 items", "use Opus") | The autoTest skill starts the runner in the background and tells you it's going |
| "How's the night run going?" / "What did it do last night?" | It reads the status and the report and sums them up |
| "Stop the night run" | It stops after the current cycle and writes the summary |
| "What should we add to the backlog?" | The Backlog Scout looks at what's done and what was found, and adds / proposes items |
| "Show the proposals" · "approve 2 and 5" · "reject 3" | Proposals become real backlog items, or are dropped for good |

You can close VS Code afterwards — the run keeps going on its own.

Before you leave:
1. Commit your own changes (or let Claude do it) — the runner won't start on a dirty tree.
2. Laptop plugged in; in Windows power settings set "When I close the lid" to *Do nothing*
   if you close it. The runner keeps Windows from sleeping while it runs.
3. VPN connected, if dev needs it.

The same by hand, from a WSL terminal in the repo folder:
```
automation/night/night-run.sh --background     # start (options: --until 06:30, --max-cycles 10,
                                               #   --model opus, --budget 10; --help for all)
automation/night/night-run.sh --status         # is it going? + the latest report
automation/night/night-run.sh --stop           # stop after the current cycle
```
Hard stop: `pkill -f night-run.sh` (the current cycle's work stays uncommitted; the next run
picks it up first).

## The Backlog Scout

An agent (`.claude/agents/ucha-backlog-scout.md`) that keeps the backlog stocked, based on
what's done and what was discovered: the Planner's plans (`specs/`), `ATTENTION.md`,
`HEALING_LOG.md`, "Not covered: …" remarks on done items, the night reports and gaps against
the documentation. The runner calls it when a night runs out of work (at most twice) and once
at the end of the night.

- **Low-risk ideas are added right away** as normal items, marked `(Scout <date>: <source>)` —
  guest or shared-student checks, error cases, fresh-account flows that stay inside that
  account; no payments, `/set-data.php`, admin data, outside emails or content others see.
- **Everything else waits for you** as `- [?]` under `## Proposed — needs your OK` at the end
  of `BACKLOG.md`. Night runs never pick those. Approve or reject them in chat; rejected ones
  are remembered and never proposed again.

## In the morning

Ask Claude "what did it do last night?", or open the newest file in
`automation/night-reports/`. It lists every cycle with the agents it used, the commits made,
new notes in `ATTENTION.md` (these need you), new `HEALING_LOG.md` entries, what the Scout
added and what it proposes (needs your OK), anything left uncommitted and the cost. Then review the commits (`git log`, `git show <sha>`) and decide
what to upload. Full session logs are in `automation/night-logs/<date>/`.

## What it can and can't do

Each cycle runs with a fixed allowlist (`automation/night/settings.template.json`) and never
stops to ask — anything not on the list is refused.

- **Can:** read the repo and the documentation, edit files in the repo, run Playwright tests,
  `git add` / `commit` / `restore`, run small probe scripts, use the Playwright browser.
- **Can't:** push or touch branches, history, `.env`, `playwright.config.ts`, `.claude/`,
  `automation/night/`, `AGENT_RULES.md`, `OPERATING_PROCEDURE.md`; no web search.
- After every cycle the runner checks nothing was pushed and it's still on `main`; if not,
  it stops. (Pushing also needs your Windows GitHub login, which WSL doesn't have.)
- Site rules every session and agent follows are in `AGENT_RULES.md`: only the test card and
  ePay demo, only `fail_reason` 101 on set-data, shared accounts are look-only, a changed
  expected text is never "fixed" — it goes to `ATTENTION.md`.

## Files

| File | What |
|---|---|
| `automation/night/night-run.sh` | the runner |
| `automation/night/cycle-prompt.md` | what each cycle is told to do |
| `automation/night/smoke-prompt.md` | the `--smoke` plumbing check |
| `automation/night/settings.template.json` | the allowlist / denylist |
| `automation/night/mcp.json` | the Playwright browser server (headless) |
| `automation/night/scout-prompt.md` | what a Backlog Scout pass is told to do |
| `automation/night/parse-cycle.py` | reads a session's result and agent use for the runner |
| `automation/AGENT_RULES.md` | rules for the cycle session and all agents |
| `.claude/agents/` | Planner, Generator, Healer (Playwright); Reviewer and Backlog Scout (ours) |
| `scripts/check-mandrill.ts` | checks the Mandrill key |
| `utils/mandrill.ts` | reads test emails from Mandrill (`expectEmail` → act → `.link()`) |
