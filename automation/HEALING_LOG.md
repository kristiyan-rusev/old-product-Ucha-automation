# Self-healing audit log

One entry per automatically-applied fix. Traces/screenshots in `test-results/` are
gitignored and get overwritten by the next run, so each entry must contain enough (the
actual error text and/or relevant DOM snippet) to reconstruct the reasoning without them.

Never log an entry for a fix you didn't actually verify (re-ran the specific test AND the
full suite, both green) before committing — see `OPERATING_PROCEDURE.md`.

Template for each entry:

```
## <ISO timestamp> — <file changed>

- **Test:** <spec file + test name that was failing>
- **Category:** stale-selector | timing | strict-mode
- **Error (verbatim):**
  ```
  <the actual Playwright error text>
  ```
- **Change:** `<old selector/code>` → `<new selector/code>`
- **Why:** <what you found on the live page that justified this>
- **Verified:** specific test passed; full suite passed (N/N)
- **Commit:** <sha>
```

---

*(no entries yet)*
