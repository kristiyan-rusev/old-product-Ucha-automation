"""Reads one session's stream-json log and prints "status<TAB>summary<TAB>cost<TAB>agents"
for night-run.sh (agents = which subagents the session started, e.g. "reviewer ×1, planner ×1")."""
import json
import re
import sys
from collections import Counter

result, cost, subtype = None, 0.0, ""
agents = Counter()
try:
    with open(sys.argv[1], encoding="utf-8") as f:
        for line in f:
            try:
                event = json.loads(line)
            except ValueError:
                continue
            if event.get("type") == "assistant":
                for block in event.get("message", {}).get("content", []) or []:
                    if block.get("type") == "tool_use" and block.get("name") in ("Agent", "Task"):
                        kind = (block.get("input") or {}).get("subagent_type") or "general-purpose"
                        agents[re.sub(r"^(playwright-test|ucha-test|ucha)-", "", kind)] += 1
            if event.get("type") == "result":
                result = event.get("result") or ""
                cost = event.get("total_cost_usd") or 0.0
                subtype = event.get("subtype") or ""
except OSError:
    pass

status, summary = "unknown", "no result — the session crashed or was killed"
if result is not None:
    m = re.findall(r"CYCLE_RESULT:\s*([a-z-]+)\s*(?:[—–-]+\s*)?(.*)", result)
    if m:
        status, summary = m[-1][0], m[-1][1].strip().strip("`").strip()
    elif "budget" in subtype:
        status, summary = "budget", "stopped by the per-session spending cap"
    else:
        summary = "ended without a CYCLE_RESULT line: " + " ".join(result.split())[-200:]
used = ", ".join(f"{name} ×{n}" for name, n in agents.most_common()) or "none"
print("\t".join(x.replace("\t", " ") for x in (status, summary, str(round(cost, 2)), used)))
