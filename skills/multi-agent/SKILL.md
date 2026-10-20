---
name: multi-agent
description: "Run multiple pi agents in herdr panes as one coordinated effort: hub-and-spoke topology, dispatch recipe, prompting, waiting, blocked-state handling, worker/verifier separation. Use when dispatching or coordinating more than one agent, with or without a task-loop skill like over-loop. Requires HERDR_ENV=1 and the herdr skill."
---

# Multi-agent collaboration

Hub-and-spoke: workers never prompt each other; all coordination flows
through the coordinator pane.

The `herdr` skill is the CLI authority. Read it first. This skill holds the
collaboration patterns; over-loop (or you, directly) decides WHAT each agent does.

Pane layout: coordinator on the left, worker top-right, verifier
bottom-right.

```
┌───────────────┬───────────────┐
│ Coordinator   │ Worker        │
│ (this pane)   │ (pi, worktree)│
│               ├───────────────┤
│               │ Verifier (pi) │
└───────────────┴───────────────┘

Operator ── intake / escalation ──► Coordinator
                                     │ herdr: split → agent start → prompt --wait
                                     ├──► Worker ──► PR
                                     ▼
                                   Verifier: diff review, tests, CI
```

## Dispatch recipe

Split the worker pane to the right of the coordinator, then split that pane
down for the verifier — this yields coordinator left, worker top-right,
verifier bottom-right.

```bash
# worker in an isolated worktree for repo work; right-hand pane, caller keeps focus
split=$(herdr pane split --current --direction right --cwd "$PWD" --no-focus)
pane=$(printf '%s\n' "$split" | jq -r '.result.pane.pane_id')
herdr agent start <worker-name> --kind pi --pane "$pane"
herdr agent prompt <worker-name> "Read .pi/tasks/<id>.md and implement it. Follow the repo's agent instructions if present (e.g. AGENTS.md). Your scope is implementation only: record results in the card's Evidence section, then stop. Do not run verification or retro, do not touch the card's Retro section or .pi/knowledge/, and do not change the card's frontmatter status/attempts — the coordinator owns the lifecycle." --wait --timeout 600000
```

Then verify with a separate agent in the pane below the worker:

```bash
split=$(herdr pane split --pane "$pane" --direction down --cwd "$PWD" --no-focus)
verifier_pane=$(printf '%s\n' "$split" | jq -r '.result.pane.pane_id')
herdr agent start <verifier-name> --kind pi --pane "$verifier_pane"
herdr agent prompt <verifier-name> "Verify .pi/tasks/<id>.md: review the diff, run the tests, report pass/fail with evidence." --wait --timeout 600000
```

Interrupt-driven escalation while workers run:

```bash
herdr agent wait <worker-name> --until blocked --timeout 600000
herdr agent read <worker-name> --source recent-unwrapped --lines 120
```

## Coordination rules

- `agent start` on a freshly split pane can fail with `agent_pane_busy`
  because the shell is not yet at its prompt. Retry once after a short pause
  before assuming the pane is unusable.
- A timeout or `agent_prompt_stalled` does not prove the prompt was not
  delivered. `agent read` the worker before retrying; never blindly resubmit.
- herdr states are for synchronization only. Completion is decided solely by
  artifacts: PR URL, test output, CI status.
- If a worker dies or its context is unusable, start a fresh worker on the
  same task card. Do not attempt to reconstruct state from terminal
  scrollback.
- Run tests/checks in plain panes (`pane run` + `pane wait-output`) when no
  agent judgment is needed; don't spend a worker on them.
- One verifier per task, separate from the worker. Self-reports are not
  verification.
