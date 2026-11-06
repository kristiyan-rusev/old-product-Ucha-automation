#!/usr/bin/env bash
# Overnight unattended test-building run for the Ucha.se suite. How-to: automation/NIGHT_RUN.md
#
#   automation/night/night-run.sh [options]
#     --until HH:MM        stop starting new cycles after this time (default 07:00)
#     --max-cycles N       at most N cycles (default 25)
#     --model NAME         model for the coordinating session (default sonnet; agents use sonnet)
#     --budget USD         spending cap per cycle (default 10)
#     --cycle-minutes N    a cycle is cut off after N minutes (default 90)
#     --trial              one real cycle with a visible browser, to watch it work
#     --smoke              5-minute plumbing check (permissions, skill, agents, browser) — no work
#     --scout              only a Backlog Scout pass: add / propose new backlog items
#     --background         detach, so closing the terminal doesn't stop the run
#     --force              start even if the working tree has uncommitted changes
#     --status             is a run going? + the latest report
#     --stop               stop after the current cycle (then the summary is written)
#
# Usually you don't call this yourself: tell Claude "work on the backlog on your own tonight"
# and the autoTest skill starts it (and answers "how's it going?" / "stop").
set -uo pipefail

ARGS=("$@")
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SELF="$REPO/automation/night/night-run.sh"
cd "$REPO"

UNTIL="07:00"; MAX_CYCLES=25; MODEL="sonnet"; BUDGET=10; CYCLE_MIN=90; MODE="night"; BACKGROUND=0; FORCE=0
ACTION=run
while [ $# -gt 0 ]; do
  case "$1" in
    --until) UNTIL="$2"; shift 2 ;;
    --max-cycles) MAX_CYCLES="$2"; shift 2 ;;
    --model) MODEL="$2"; shift 2 ;;
    --budget) BUDGET="$2"; shift 2 ;;
    --cycle-minutes) CYCLE_MIN="$2"; shift 2 ;;
    --trial) MODE="trial"; shift ;;
    --smoke) MODE="smoke"; shift ;;
    --scout) MODE="scout"; shift ;;
    --background) BACKGROUND=1; shift ;;
    --force) FORCE=1; shift ;;
    --status) ACTION=status; shift ;;
    --stop) ACTION=stop; shift ;;
    -h|--help) sed -n '2,21p' "$SELF"; exit 0 ;;
    *) echo "Unknown option: $1 (see --help)"; exit 2 ;;
  esac
done

mkdir -p automation/night-logs
PIDFILE=automation/night-logs/running.pid
running_pid() { local p; p=$(cat "$PIDFILE" 2> /dev/null) && kill -0 "$p" 2> /dev/null && echo "$p"; }

if [ "$ACTION" = status ]; then
  if p=$(running_pid); then echo "A night run is going (pid $p)."; else echo "No night run is going."; fi
  [ -f automation/night/STOP ] && running_pid > /dev/null && echo "A stop was requested — it ends after the current cycle."
  r=$(ls -t automation/night-reports/*.md 2> /dev/null | head -1)
  [ -n "$r" ] && { echo; echo "Latest report: $r"; echo; cat "$r"; }
  echo; echo "Last runner lines:"; tail -5 automation/night-logs/latest-console.log 2> /dev/null
  exit 0
fi
if [ "$ACTION" = stop ]; then
  if p=$(running_pid); then
    touch automation/night/STOP
    echo "Stop requested (pid $p) — the current cycle finishes first, then the summary is written."
  else
    echo "No night run is going."
  fi
  exit 0
fi
if p=$(running_pid); then echo "A night run is already going (pid $p) — use --status or --stop."; exit 1; fi

# Checked here (not only in the detached run) so whoever starts it sees the problem right away.
dirty=$(git status --porcelain | grep -v ' test-data/created-accounts.log$' || true)
if [ -n "$dirty" ] && [ "$FORCE" != 1 ]; then
  echo "The working tree has uncommitted changes. Commit them first (or pass --force):"
  echo "$dirty"
  exit 1
fi
[ "$(git rev-parse --abbrev-ref HEAD)" = main ] || { echo "Not on main — switch to main first."; exit 1; }

if [ "$BACKGROUND" = 1 ]; then
  rest=(); for a in "${ARGS[@]}"; do [ "$a" != "--background" ] && rest+=("$a"); done
  setsid nohup "$SELF" "${rest[@]}" > automation/night-logs/latest-console.log 2>&1 < /dev/null &
  sleep 3
  if p=$(running_pid); then
    echo "Night run started in the background (pid $p)."
    echo "  Status:  automation/night/night-run.sh --status"
    echo "  Stop:    automation/night/night-run.sh --stop   (finishes the current cycle first)"
  else
    echo "The night run didn't start:"; cat automation/night-logs/latest-console.log
    exit 1
  fi
  exit 0
fi

echo $$ > "$PIDFILE"
trap 'rm -f "$PIDFILE"' EXIT

# Model aliases → current models, for the cycle session and the agents (they say `model: sonnet`).
export ANTHROPIC_DEFAULT_SONNET_MODEL=claude-sonnet-5-5 ANTHROPIC_DEFAULT_OPUS_MODEL=claude-opus-5-5

now() { date +%s; }
case "$MODE" in
  smoke) MAX_CYCLES=1; CYCLE_MIN=15; STOP_EPOCH=$(( $(now) + 20 * 60 )); PROMPT_FILE=automation/night/smoke-prompt.md ;;
  trial) MAX_CYCLES=1; STOP_EPOCH=$(( $(now) + CYCLE_MIN * 60 )); PROMPT_FILE=automation/night/cycle-prompt.md ;;
  scout) MAX_CYCLES=0; STOP_EPOCH=$(( $(now) + 30 * 60 )); PROMPT_FILE=automation/night/cycle-prompt.md ;;
  *) STOP_EPOCH=$(date -d "$UNTIL" +%s)
     [ "$STOP_EPOCH" -le "$(now)" ] && STOP_EPOCH=$(date -d "tomorrow $UNTIL" +%s)
     PROMPT_FILE=automation/night/cycle-prompt.md ;;
esac
# The visible browser (the repo's .mcp.json) for a trial; headless otherwise.
MCP_CONFIG=automation/night/mcp.json; [ "$MODE" = trial ] && MCP_CONFIG=.mcp.json

STAMP=$(date +%Y-%m-%d_%H%M)
LOGDIR="automation/night-logs/$STAMP"
REPORT="automation/night-reports/$STAMP-$MODE.md"
mkdir -p "$LOGDIR" automation/night-reports
log() { echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOGDIR/runner.log"; }

# ---------------------------------------------------------------- preflight
command -v claude > /dev/null || { log "claude CLI not found"; exit 1; }
rm -f automation/night/STOP

env_up() {
  local body
  body=$(curl -s -m 20 https://t.ucha.dev/ || true)
  [ -n "$body" ] && ! grep -q "Softaculous" <<< "$body"
}

log "Checking email access…"
if out=$(timeout 300 npx tsx scripts/check-mandrill.ts 2>&1); then
  EMAIL="$out"
else
  EMAIL="NOT available ($(tail -1 <<< "$out")) — fresh accounts can't be confirmed tonight"
fi
log "Email: $EMAIL"
ENV_AT_START=down; env_up && ENV_AT_START=up
log "t.ucha.dev: $ENV_AT_START"

SETTINGS="$LOGDIR/settings.json"
sed "s#{{REPO}}#${REPO#/}#g" automation/night/settings.template.json > "$SETTINGS"

# Keep Windows from going to sleep while the run is going. The PowerShell loop only holds the
# "system required" request while the lock file keeps being touched (every minute, by a helper
# that dies with this script) — so even a hard-killed run lets the laptop sleep again within
# ~5 minutes. The lock's path reaches PowerShell as a Windows path through WSLENV.
export NIGHT_AWAKE_LOCK="$REPO/$LOGDIR/awake.lock" WSLENV="${WSLENV:+$WSLENV:}NIGHT_AWAKE_LOCK/p"
touch "$NIGHT_AWAKE_LOCK"
( while kill -0 $$ 2> /dev/null; do touch "$NIGHT_AWAKE_LOCK"; sleep 60; done; rm -f "$NIGHT_AWAKE_LOCK" ) &
PS=/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe
if [ -x "$PS" ]; then
  "$PS" -NoProfile -Command '$t = Add-Type -Name K -Namespace W -PassThru -MemberDefinition "[DllImport(""kernel32.dll"")] public static extern uint SetThreadExecutionState(uint f);"; $f = $env:NIGHT_AWAKE_LOCK; while ((Test-Path -LiteralPath $f) -and ((Get-Item -LiteralPath $f).LastWriteTime -gt (Get-Date).AddMinutes(-5))) { $t::SetThreadExecutionState(0x80000001) | Out-Null; Start-Sleep 60 }' > /dev/null 2>&1 &
fi
trap 'rm -f "$NIGHT_AWAKE_LOCK" "$PIDFILE"' EXIT

START_SHA=$(git rev-parse HEAD)
ORIGIN_SHA=$(git rev-parse origin/main 2> /dev/null || echo none)
{
  echo "# Night run $STAMP ($MODE)"
  echo
  if [ "$MODE" = scout ]; then
    echo "- Backlog Scout pass only, started $(date '+%Y-%m-%d %H:%M')"
  else
    echo "- Started $(date '+%Y-%m-%d %H:%M'), stops starting new cycles at $(date -d "@$STOP_EPOCH" '+%H:%M'); up to $MAX_CYCLES cycles of max $CYCLE_MIN min"
  fi
  echo "- Model: $MODEL; spending cap per session: \$$BUDGET"
  echo "- Starting commit: $(git log -1 --format='%h %s')"
  echo "- Email for fresh accounts: $EMAIL"
  echo "- t.ucha.dev at start: $ENV_AT_START"
  echo
  echo "## Cycles"
  echo
} > "$REPORT"
log "Report: $REPORT"

# ---------------------------------------------------------------- one Claude session
total_cost=0
declare -A counts=()

# run_session <prompt file> <log name> <label in report> <minutes> [why] → status summary cost agents
run_session() {
  local file=$1 name=$2 label=$3 minutes=$4 why=${5:-} t0 before rc prompt
  prompt=$(< "$file")
  prompt=${prompt//'{{CYCLE}}'/${label#\#}}
  prompt=${prompt//'{{EMAIL_STATUS}}'/$EMAIL}
  prompt=${prompt//'{{MINUTES_LEFT}}'/$(( (STOP_EPOCH - $(now)) / 60 ))}
  prompt=${prompt//'{{CYCLE_MINUTES}}'/$minutes}
  prompt=${prompt//'{{REPORT}}'/$REPORT}
  prompt=${prompt//'{{STAMP}}'/$STAMP}
  prompt=${prompt//'{{REASON}}'/$why}

  log "$label — starting (cut off after $minutes min)"
  t0=$(now); before=$(git rev-parse HEAD)
  timeout --kill-after=60 "${minutes}m" claude -p "$prompt" \
    --model "$MODEL" --permission-mode dontAsk \
    --setting-sources user,project --settings "$SETTINGS" \
    --mcp-config "$MCP_CONFIG" --strict-mcp-config \
    --add-dir /mnt/c/Users/kristiyan.rusev/Desktop/Claude/Documentation \
    --add-dir "$HOME/.claude/user-plugins/plugins/test-automation" --add-dir /tmp \
    --max-budget-usd "$BUDGET" \
    --output-format stream-json --verbose \
    --name "night $STAMP $label" \
    > "$LOGDIR/$name.jsonl" 2> "$LOGDIR/$name.err"
  rc=$?

  IFS=$'\t' read -r status summary cost agents < <(python3 -I automation/night/parse-cycle.py "$LOGDIR/$name.jsonl")
  { [ "$rc" = 124 ] || [ "$rc" = 137 ]; } && status="timeout" && summary="cut off after $minutes min"
  status=${status:-unknown}; cost=${cost:-0}; agents=${agents:-none}
  total_cost=$(python3 -I -c "print(round($total_cost + $cost, 2))")
  counts[$status]=$(( ${counts[$status]:-0} + 1 ))
  local commits; commits=$(git log --format='%h' "$before"..HEAD | tr '\n' ' ')
  log "$label — $status after $(( ($(now) - t0) / 60 )) min (\$$cost) — $summary ${commits:+[commits: $commits]} [agents: $agents]"
  grep -q "^- $label " "$REPORT" || echo "- $label $(date +%H:%M) $status — $summary (written by the runner) ${commits:+commits: $commits}" >> "$REPORT"
  echo "  - agents used: $agents" >> "$REPORT"
}

# Nothing may have been pushed and we must still be on main.
safe() {
  if [ "$(git rev-parse origin/main 2> /dev/null || echo none)" != "$ORIGIN_SHA" ]; then reason="ALERT: origin/main changed during the run"; return 1; fi
  [ "$(git rev-parse --abbrev-ref HEAD)" = main ] || { reason="ALERT: no longer on main"; return 1; }
}

scouts=0; added=0
scout() {
  scouts=$((scouts + 1))
  run_session automation/night/scout-prompt.md "scout-$scouts" "scout" 30 "$1"
  added=0; [[ $summary =~ added\ ([0-9]+) ]] && added=${BASH_REMATCH[1]}
}

# ---------------------------------------------------------------- cycles
cycle=0; idle=0; errors=0; down_since=""; reason=""; status=""

if [ "$MODE" = scout ]; then
  scout "asked for directly — propose what to work on next"
  safe || true
  reason=${reason:-scout pass done}
else
  while :; do
    [ -f automation/night/STOP ] && { reason="STOP file"; break; }
    [ "$(now)" -ge "$STOP_EPOCH" ] && { reason="stop time reached"; break; }
    [ "$cycle" -ge "$MAX_CYCLES" ] && { reason="max cycles ($MAX_CYCLES) reached"; break; }

    if [ "$MODE" != smoke ] && ! env_up; then
      down_since=${down_since:-$(now)}
      if [ $(( $(now) - down_since )) -ge 7200 ]; then reason="t.ucha.dev down for 2 hours"; break; fi
      log "t.ucha.dev is down (VPN?) — waiting 10 min"
      sleep 600; continue
    fi
    down_since=""

    cycle=$((cycle + 1))
    minutes_left=$(( (STOP_EPOCH - $(now)) / 60 ))
    cmin=$CYCLE_MIN; [ "$minutes_left" -lt "$cmin" ] && cmin=$(( minutes_left > 20 ? minutes_left : 20 ))
    run_session "$PROMPT_FILE" "cycle-$cycle" "#$cycle" "$cmin"
    safe || break

    case "$status" in
      built|partial|healed) idle=0; errors=0 ;;
      env-down) sleep 600 ;;
      nothing-to-do|blocked)
        errors=0
        if [ "$MODE" = night ] && [ "$scouts" -lt 2 ]; then
          # Out of work: let the Backlog Scout add low-risk items that can run tonight.
          scout "the backlog ran out of items that can be done tonight — add low-risk items that can run now (email: $EMAIL)"
          safe || break
          if [ "$added" -gt 0 ]; then idle=0; else reason="nothing left that can be done unattended (the Scout found nothing new to add)"; break; fi
        else
          idle=$((idle + 1)); [ "$idle" -ge 2 ] && { reason="nothing left that can be done unattended"; break; }
        fi ;;
      smoke-ok|smoke-fail) reason="smoke check done"; break ;;
      *) errors=$((errors + 1))
        [ "$errors" -ge 3 ] && { reason="3 cycles in a row ended without a result"; break; } ;;
    esac
    sleep 30
  done

  # End of the night: propose what to work on next — unless the Scout just ran, the user asked
  # to stop, or something went wrong.
  if [ "$MODE" = night ] && [ "$status" != scouted ] && [ "$reason" != "STOP file" ] && [[ "$reason" != ALERT* ]]; then
    scout "end of the night — propose what to work on next, based on what tonight built and found"
    safe || true
  fi
fi

# ---------------------------------------------------------------- summary
list_or_none() { local l; l=$(cat); echo "${l:-  - none}"; }
{
  echo
  echo "## Summary (written by the runner)"
  echo
  echo "- Finished $(date '+%Y-%m-%d %H:%M') — $reason"
  echo "- Sessions: $cycle cycles + $scouts Scout passes ($(for k in "${!counts[@]}"; do printf '%s %s, ' "$k" "${counts[$k]}"; done | sed 's/, $//'))"
  echo "- Cost: about \$$total_cost"
  echo "- Commits (local only — nothing was pushed):"
  git log --reverse --format='  - %h %s' "$START_SHA"..HEAD | list_or_none
  echo "- New notes in automation/ATTENTION.md (need you):"
  git diff "$START_SHA" -- automation/ATTENTION.md | grep -E '^\+\*\*' | sed 's/^+/  - /' | list_or_none
  echo "- New entries in automation/HEALING_LOG.md:"
  git diff "$START_SHA" -- automation/HEALING_LOG.md | grep -E '^\+## ' | sed 's/^+## /  - /' | list_or_none
  echo "- Added to the backlog by the Scout (picked up by the next runs):"
  git diff "$START_SHA" -- automation/BACKLOG.md | grep -E '^\+- \[ \]' | sed 's/^+- \[ \] /  - /' | cut -c1-120 | list_or_none
  echo "- Proposed by the Scout — need your OK (say \"approve …\" or \"reject …\" in chat):"
  git diff "$START_SHA" -- automation/BACKLOG.md | grep -E '^\+- \[\?\]' | sed 's/^+- \[?\] /  - /' | cut -c1-120 | list_or_none
  left=$(git status --porcelain | grep -v ' test-data/created-accounts.log$' || true)
  echo "- Uncommitted changes left behind: ${left:-none}"
  echo "- Logs: $LOGDIR"
} >> "$REPORT"
log "Done — $reason. Report: $REPORT"
