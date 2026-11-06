# over

**over: Observe, Execute, Verify, Retro.**

Run `/over fix the flaky checkout test` to start the loop. The coordinator
reproduces the problem and writes a task card. It then selects an execution
mode.

An available orchestrator supplies separate workers and verifiers. Without an
orchestrator, one agent runs the full loop. The coordinator closes the task
with a retro. The retro records approved lessons.

```text
/over <task>
   │
 Observe ──→ Execute ──→ Verify ──→ Retro ──→ done
 reproduce    implement    artifact    lessons      │
 + card       worker/self  review      record      │ fail ×2, merge,
               │             │                      │ destructive, or
               ▼             ▼                      ▼ external comms
           task card      artifacts              escalate
           is the spec    are the proof          to you
```

## Install

```bash
pi install git:github.com/vincent178/over
```

Run `/over <task>` after installation.

The coordinator inspects the available tools and skills before execution.
It looks for an agent orchestrator. The orchestrator manages workers and
verifiers.

Without an orchestrator, one agent runs the full loop. `over` does not require
or install an orchestrator. It has no direct Herdr dispatch path.

## Why

- **The task card is the source of truth.** Worker context is volatile. The
  task card persists in `.pi/tasks/<id>.md`.
- **The task card contains the specification.** It records the objective, Done
  criteria, context, boundaries, evidence, escalation log, and retro.
- **Artifacts provide completion proof.** Self-reports and orchestrator states
  do not prove completion.
- **Orchestrated tasks use an independent verifier.** Single-agent tasks record
  that verification was not independent.
- **The retro converts friction into lessons.** Approved lessons update
  knowledge, skills, or rules. `lessons: none` is also valid.
- **The operator controls important gates.** The coordinator stops for merge,
  deployment, destructive actions, external communication, and repeated failure.

## Usage

```text
/over <task description>
```

There is one command and no configuration. The coordinator follows
`over-loop`. It also follows the selected orchestrator's skill.

Task cards are plain Markdown in `./.pi/tasks`. Pi's native file tools create
and update task cards. Git history provides the index.

## How it works

**Observe.** Reproduce or baseline the problem. Search `.pi/knowledge/` for
relevant systems. Add relevant pointers to the task card. Never execute a
paraphrase of a report.

**Execute.** Use an orchestrator for worker dispatch when one is available.
Otherwise, implement in the current session. Use interrupt-driven waits for
orchestrated work. Do not poll.

The task-card status follows this lifecycle:

```text
intake → dispatched → implementing → verifying → retro → done | escalated
```

**Verify.** Orchestrated tasks use one verifier per task. The verifier must be
separate from the worker. Single-agent tasks record the lack of independent
verification.

Every mode reviews the diff and runs the tests again. Verification includes
adversarial review. The verdict and evidence go on the task card. Two failed
verifications require operator escalation.

**Retro.** Only the coordinator runs the retro. It collects friction events
and drafts candidate lessons. The operator reviews candidates one at a time.
The coordinator records only approved lessons. It then moves the task to
`done`.

## Development

Pi loads the TypeScript extension through jiti. No build step is required.

```bash
pi -ne -e ./extensions/index.ts
```

The `-ne` option prevents conflicts with an installed copy.

Declare host packages in `peerDependencies`. Host packages include
`@earendil-works/*`. Never bundle host packages. See `AGENTS.md` for the full
contribution protocol.

## License

MIT
