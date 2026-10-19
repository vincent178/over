# over

**A task loop for [pi](https://github.com/earendil-works/pi) agents: Observe, Execute, Verify, Retro.**

Run `/over fix the flaky checkout test` — and the agent becomes a coordinator: it
reproduces the problem, writes a task card, dispatches a worker agent to implement,
sends a *separate* verifier to prove the result, and closes with a retro that writes
lessons back into your knowledge base, skills, and rules. You get interrupted only at
the gates that matter.

```text
/over <task>
   │
 Observe ──→ Execute ──→ Verify ──→ Retro ──→ done
 reproduce    worker       separate    lessons      │
 + card       agents       verifier    write back   │ fail ×2, merge,
               │             │                      │ destructive, or
               ▼             ▼                      ▼ external comms
           task card      artifacts              escalate
           is the spec    are the proof          to you
```

## Install

```bash
pi install git:github.com/vincent178/over
```

That's it. Try it: `/over <something small and real>` in any project.

Worker dispatch uses [herdr](https://github.com/herdrdev/herdr) panes and needs
`HERDR_ENV=1` (set inside herdr-managed panes) plus the `herdr` skill. Without herdr
the `/over` command warns and the same loop runs single-agent.

## Why

- **The card is the source of truth, not the chat** — worker context is volatile
  (compaction, restarts, rebuilds). Everything that matters lives in `.pi/tasks/<id>.md`:
  objective, done criteria, evidence, escalation log, retro. Dispatch sends the card
  path, never an inline spec.
- **Only artifacts are proof** — worker self-reports and pane states don't count. A
  separate verifier reviews the diff, re-runs the checks, and puts its verdict on the
  card.
- **Friction becomes assets** — the retro turns every redispatch, escalation, and
  observe-miss into a candidate lesson with a typed destination: `.pi/knowledge/`, a skill
  fix, or a rule. `lessons: none` is a valid outcome; manufactured lessons are not.
- **Humans at the gates, nowhere else** — the loop runs without per-step input, but
  always stops for: merge and deploy, destructive actions, external communication in
  your name, and any task that fails verification twice.

## Usage

```text
/over <task description>     # run the task through the loop
```

There is one command and no configuration. The coordinator follows the bundled skills:
`over-loop` (the procedure: phases, card format, escalation gates) and `multi-agent`
(herdr pane topology, dispatch recipe, blocked-state handling). Task cards are plain
Markdown in `./.pi/tasks`, written with pi's native file tools; git history is the index.

## How it works

**Observe.** Reproduce or baseline the problem first — never dispatch on a paraphrase
of a report. Search `.pi/knowledge/` for the systems involved and put the pointers on the
card; the card is the worker's only context.

**Execute.** Dispatch workers per the multi-agent skill and monitor interrupt-driven
(`agent wait --until blocked`), not by polling. The card's status tracks the task:
`intake → dispatched → implementing → verifying → retro → done | escalated`.

**Verify.** One verifier per task, separate from the worker. It reviews the diff and
re-runs the checks; the verdict goes on the card. Twice-failed tasks go to you, not
back to a worker.

**Retro.** The coordinator runs it (it holds the decision context): collects friction
events, drafts candidate lessons, reviews them with you one at a time, and writes only
ratified ones. Then the card moves to `done`.

## Development

No build step — pi loads the TypeScript extension via jiti.

```bash
pi -ne -e ./extensions/index.ts   # -ne avoids conflicts with an installed copy
```

Host-provided packages (`@earendil-works/*`) are peer dependencies and must never be
bundled. See [AGENTS.md](AGENTS.md) for the full contribution protocol.

## License

MIT
