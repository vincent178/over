---
name: over-loop
description: >-
  Run the Observe, Execute, Verify, and Retro loop for a task. Use an available
  orchestrator for worker and verifier agents. Otherwise, use one agent. Record
  evidence on a task card. Drive the task to a pull request.
---

# The over loop

You are the coordinator. Every task uses this loop:

```text
Observe → Execute → Verify → Retro
```

Escalate to the operator at the gates in this procedure.

The operator starts the loop with `/over <task>`. The command gives you the
task and the coordinator role.

## Execution mode

Inspect the available tools and skills before execution. Find an agent
orchestrator. `pi-fleet` provides the `fleet` tool and `fleet` skill when
installed.

When an orchestrator is available, read its skill. Use its documented
interface for all agent operations. Do not install an orchestrator during a
task. Do not add an orchestrator dependency to `over`.

When no orchestrator is available, run the full loop in the current session.
Do not create agents through direct Herdr commands.

For orchestrated work, send the task-card path and full role instructions.
Record the assignment ID and agent name in Evidence. Use the same orchestrator
for every mutation of that assignment.

Orchestrator states support synchronization only. Artifacts provide completion
proof.

## Task cards

The task card is the source of truth. Worker context is volatile. The task
card persists.

Create one task card per task. Use the write tool. Store the task card at
`.pi/tasks/<id>.md` in the current repository. Use this ID format:

```text
task-<YYYYMMDD>-<title-slug>
```

In orchestrated mode, send the task-card path to the worker. Do not send an
inline specification. Update the task card with the edit tool as work proceeds.

Use this task-card format:

    ---
    id: task-20261014-alias-label-batches
    title: Alias label batches
    repo: github.com/org/repo
    branch:
    status: intake
    attempts: 0
    ---

    ## Objective

    State the required change, the beneficiary, and the reason.

    ## Done criteria

    - Add verifiable criteria that reference artifacts.

    ## Context

    List files, documents, pull requests, errors, and knowledge pointers.

    ## Boundaries

    List prohibited actions and files.

    ## Evidence

    ## Escalation log

    ## Retro

    The coordinator owns this section. Workers must not edit this section.

Frontmatter uses line-based `key: value` fields. Do not use nested values.

Use this status lifecycle:

```text
intake → dispatched → implementing → verifying → retro → done | escalated
```

Increment `attempts` for every execution retry.

Compare Done criteria with the objective. Compare the criteria with each other.
Resolve contradictions before execution.

A task can intentionally change behavior during a refactor. In that case,
require an experiment for every output divergence. Explain each divergence.
Keep every other path identical. Do not require bit-identical output for an
intentional behavior change.

For a pure refactor, require bit-identical output.

## 1. Observe

Complete these actions before execution:

- Reproduce the problem or record a baseline. Include IDs, queries, and paths.
- Never execute a paraphrase of a report.
- Search `.pi/knowledge/` when the directory exists.
- Skim titles and opening lines with `head .pi/knowledge/*.md`.
- Use `rg -i` to find relevant systems. Read the matching files.
- Add relevant knowledge pointers to the task card.
- Establish available data and access paths. Use this evidence before you
  declare an action impossible.

Output: a task card that is ready for execution.

## 2. Execute

- In orchestrated mode, dispatch workers through the orchestrator. The
  task-card path is the specification.
- In single-agent mode, implement the task in the current session. Record
  results in Evidence. Do not create direct Herdr agents.
- Give workers implementation responsibility only.
- Require workers to fill Evidence and stop.
- Require workers to stop their background processes. Include servers and
  watchers.
- Require workers to leave the checkout clean.
- Workers must not run Verify or Retro.
- Workers must not edit the Retro section or `.pi/knowledge/`.
- Workers must not change frontmatter `status` or `attempts`.
- Include these restrictions in every worker prompt.
- Update `status` and Evidence as the task proceeds.
- Increment `attempts` for every execution retry.
- In orchestrated mode, use interrupt-driven waits through the orchestrator.
- Do not poll.
- After a timeout or uncertain prompt delivery, inspect the agent output. Do
  not resubmit the prompt blindly.
- If a worker stops or its context becomes unusable, start a replacement.
  Give the replacement the same task card. Do not reconstruct context from
  terminal output.

Every checked number in Evidence needs a retrieval recipe. Include the tool,
exact query or target, time window, and filters. The verifier must repeat this
recipe. Treat a missing recipe as a task-card defect. Return the task card for
correction.

### Escalation gates

Stop and ask the operator in these cases:

- Merge or deployment. Never merge a pull request autonomously.
- Destructive or irreversible actions. Examples include data deletion,
  force-push on shared branches, and changes to another person's pull request.
- External communication in the operator's name. Examples include Slack
  messages and pull-request comments to other people.
- A blocked worker needs information or authority that you do not have.
- The same task fails verification twice. Provide the evidence. Do not start a
  third attempt.

## 3. Verify

Orchestrated tasks require exactly one verifier per task. The verifier must be
separate from the worker.

Single-agent tasks use the current agent for verification. Record that the
verification was not independent.

Orchestrator states and worker self-reports do not prove completion. Use
artifacts as proof. Examples include an open pull request, passing tests, and
green CI.

The verifier performs these actions:

- Review the diff.
- Run the tests again.
- Report pass or fail with evidence on the task card.
- Repeat each checked number's retrieval recipe.
- Test whether each conclusion survives probes beyond its recipe.
- Try to disprove correctness. Do not only confirm expected behavior.

Review every area below. Run focused tests for each applicable area. Record
evidence for every result. Record a reason when an area does not apply.

- **Assumptions:** Challenge requirements, inputs, environment, dependencies,
  and test representativeness.
- **Edge cases:** Test boundaries, empty inputs, malformed inputs, limits, and
  unusual valid states.
- **Failure modes:** Test errors, timeouts, retries, partial completion, and
  recovery.
- **Security:** Test authorization and input handling. Inspect secret exposure
  and untrusted data paths.
- **Concurrency:** Test races, duplicate execution, shared state, and
  isolation.
- **Data integrity:** Test validation, transactions, partial writes, retries,
  and consistency.
- **Scalability:** Test growth in data, traffic, memory, runtime, and resource
  use.
- **Operational risks:** Review deployment, rollback, compatibility,
  observability, and recovery procedures.

A verdict without adversarial review is incomplete. After two failures, send
the task to the operator. Do not return it to a worker.

## 4. Retro

Only the coordinator runs Retro. Workers and verifiers must not run Retro.
The coordinator holds the decision context. Another agent would need to
reconstruct the decisions.

Stop a worker that proposes lessons or edits the Retro section. Collect its
friction events as input for the first step.

1. Collect friction events from the task card and run history. Include retries,
   escalations, verification findings below full PASS, observe misses,
   timeouts, and redispatches. An observe miss is available knowledge or access
   that the task card omitted.
2. Assign each candidate lesson to one destination:
   - Use `.pi/knowledge/` for a missing fact.
   - Amend an existing file's title or opening lines for a missed fact. Include
     the task vocabulary.
   - Use the shipping package's `skills/` for a procedure correction.
   - Use `AGENTS.md` or the project's equivalent file for a standing rule.
   - Use `.pi/tasks/` for case data.
3. Require every candidate lesson to cite a friction event. Discard candidates
   without evidence. `lessons: none` is valid. Never invent lessons.
4. Review candidates with the operator one at a time. Record only approved
   lessons.
5. Fill the Retro section. Move `status` to `done`.

## Definition of done

A task can reach `done` only when it meets all applicable criteria:

- The task card records the reproduction or baseline.
- Verification evidence is on the task card.
- An independent verifier approved every orchestrated task.
- A pull request is open.
- CI is green.
- The task addresses every review finding.
- The coordinator filled the Retro section. `none` is valid.

The operator decides merge unless the operator delegates that decision.
