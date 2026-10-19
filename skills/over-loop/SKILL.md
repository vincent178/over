---
name: over-loop
description: Coordinate end-to-end task completion with the Observe-Execute-Verify-Retro loop, triggered by the /over command; task cards as source of truth, worker agents for implementation, a separate verifier for artifact-based proof, and a coordinator-run retro that writes lessons back into knowledge/, skills, and rules. Use when a task should be decomposed, dispatched, verified independently, and driven to a PR without per-step human input. Worker dispatch requires HERDR_ENV=1 and the multi-agent skill; without herdr the loop runs single-agent.
---

# The over loop

You are the coordinator. Worker agents launch on your orders.
Every task runs through the loop (**Observe → Execute → Verify → Retro**),
and you escalate to the human operator at the gates listed below. You do not
write the implementation yourself.

Entry point: the operator runs `/over <task>`, which hands you the task and
puts you in the coordinator role. Worker dispatch needs herdr
(`HERDR_ENV=1`); without it, run the same loop single-agent.

The mechanics of running multiple agents (pane topology, dispatch, waiting,
blocked-state handling) live in the `multi-agent` skill. Read it before your
first dispatch. All pane/agent operations go through the `herdr` CLI.

## Task cards

The task card is the single source of truth. Worker context is volatile
(compaction, restarts, rebuilds); the card is not. Create one card per task
with the write tool at `.pi/tasks/<id>.md` in the current repo, id
`task-<YYYYMMDD>-<title-slug>`. Dispatch by sending the worker the card
path, not an inline spec. Move the card and record evidence with the edit
tool as the task progresses.

Canonical card format (frontmatter is line-based `key: value`, no nested
values):

    ---
    id: task-20261014-alias-label-batches
    title: Alias label batches
    repo: github.com/org/repo
    branch:
    status: intake
    attempts: 0
    ---

    ## Objective

    One paragraph: what changes, for whom, why now.

    ## Done criteria

    - Verifiable, artifact-anchored criteria.

    ## Context

    Files, docs, prior PRs, error IDs, .pi/knowledge/ pointers.

    ## Boundaries

    What the worker must not touch.

    ## Evidence

    ## Escalation log

    ## Retro

    (coordinator only — workers never fill this section)

Card status lifecycle:
`intake → dispatched → implementing → verifying → retro → done | escalated`.
Increment `attempts` on every redispatch.

## 1. Observe

Before any dispatch:

- Reproduce or baseline the problem; anchor evidence (IDs, queries, file
  paths). Never dispatch on a paraphrase of a report.
- `rg` the repo's `.pi/knowledge/` for the task's systems and keywords: access
  paths, domain semantics, dead ends. Inline the relevant pointers into the
  card; the card is the worker's only context.
- Establish which data/access paths actually exist before letting a card
  declare anything impossible.

Output: the task card, ready for dispatch.

## 2. Execute

- Dispatch workers per the multi-agent skill; the card path is the spec.
- Workers own implementation only. They fill Evidence and stop; they never
  run Verify or Retro, never fill the card's Retro section, and never write
  to `.pi/knowledge/`. Say so in the dispatch prompt.
- Update the card's status field and Evidence section as the task moves;
  increment `attempts` on every redispatch.
- Monitor interrupt-driven (`agent wait --until blocked`), not by polling.

### Escalation gates (always stop and ask the human operator)

- Merge and deploy. Never merge a PR autonomously.
- Destructive or irreversible actions (data deletion, force-push on shared
  branches, touching another person's PR).
- External communication in the operator's name (Slack messages, PR comments
  to others).
- A worker is `blocked` and you lack the authority or information to answer.
- The same task fails verification twice. Escalate with the evidence instead
  of retrying a third time.

## 3. Verify

- One verifier per task, separate from the worker. herdr `idle`/`done`
  states and worker self-reports are not proof of completion. Only
  artifacts are: PR exists, tests pass, CI green.
- The verifier reviews the diff, re-runs the checks, and reports pass/fail
  with evidence; the verdict goes on the card.
- Twice-failed tasks go to the operator, not back to a worker.

## 4. Retro

Only the coordinator runs the retro — never a worker, never the verifier.
The coordinator holds the full decision context; another agent would have to
reconstruct why each call was made. If a worker starts volunteering lessons
or editing the card's Retro section, stop it and collect its friction events
yourself as raw input to step 1.

1. Collect friction events from the card and run history: attempts > 1,
   escalations, verifier findings below full PASS, observe misses
   (knowledge/access that existed but wasn't on the card), timeouts,
   redispatches.
2. Turn each into a candidate lesson with a typed destination:
   `.pi/knowledge/` (a fact that was missing), the shipping package's `skills/`
   (a procedure fix), `AGENTS.md` (a rule), or case data that stays in
   `.pi/tasks/`.
3. Every candidate must cite its friction event; candidates without one are
   discarded. `lessons: none` is the default and a valid outcome. Never
   manufacture lessons.
4. Review candidates with the operator one at a time; write only ratified
   lessons.
5. Fill the card's Retro section, then move status to `done`.

## Definition of done for a task

Card status `done` requires: reproduction/baseline recorded, change verified
by the verifier with evidence on the card, PR open, CI green, review findings
addressed, and the Retro section filled (even if `none`). Merge is the
operator's call unless they say otherwise.
