You are running UNATTENDED as a Backlog Scout pass of the night run for the Ucha.se suite.
Why now: **{{REASON}}**. Nobody is watching and nobody will answer — never ask questions.
Don't work on any backlog item and don't write tests in this session.

Follow "Shell commands" in `automation/AGENT_RULES.md`: never `cd`, no `$(…)` or heredocs,
and a refused command means simplify it, not stop. `git`, `curl` and `date` are allowed.

1. Start the `ucha-backlog-scout` agent. Tell it why it runs (above), that tonight's report is
   `{{REPORT}}`, and that email for fresh accounts is: {{EMAIL_STATUS}}. If the reason is that
   the backlog ran out, ask it to favour low-risk items that can run tonight (with email
   unavailable that means guest or shared-student items).
2. Check what it changed with `git diff automation/BACKLOG.md`: only added lines (no removed
   or changed ones), new `- [ ]` items above the `## Proposed — needs your OK` heading and
   `- [?]` items below it. If anything else changed, `git restore automation/BACKLOG.md`, add
   a note to `automation/ATTENTION.md`, and end as `blocked`.
3. If it added anything: `git add automation/BACKLOG.md`, then
   `git commit -m "Backlog Scout: <N> added, <M> proposed" -m "Night-Run: {{STAMP}} scout"`.
4. Append one line to `{{REPORT}}` under `## Cycles` (time from `date +%H:%M`):
   `- scout HH:MM scouted — added <N>, proposed <M> — <one-line gist of what>`
5. End your final message with exactly one line:
   `CYCLE_RESULT: scouted — added <N>, proposed <M>`
