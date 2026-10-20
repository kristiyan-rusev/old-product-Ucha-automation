# autoTest skill (Claude Code plugin)

The Claude Code skill used to write and extend this suite (`/test-automation:autoTest`).
It is a copy of the `test-automation` plugin: `skills/autoTest/SKILL.md` holds the
instructions, `references/playwright-docs/` an offline copy of the Playwright docs
(JS/TypeScript only) that the skill reads on demand.

To use it, copy this folder into your Claude Code plugins directory as `test-automation`,
e.g. `~/.claude/user-plugins/plugins/test-automation/`, then run `/test-automation:autoTest`.

For unattended runs the skill follows `../OPERATING_PROCEDURE.md` and works through
`../BACKLOG.md`.
