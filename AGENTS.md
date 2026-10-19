# over

**over** is the OEVR (Observe, Execute, Verify, Retro) multi-agent
collaboration framework, shipped as a pi package. It ships an extension
(`extensions/`: the `/over` command that triggers the loop) and skills
(`skills/`). See `README.md` for the layout.

## Hard boundary

over is operator-agnostic. Anything specific to an employer, a repo, or a
person (knowledge, task cards, identity, operational rules, MCP wiring)
belongs in the consuming project, never here. Skills and extension code must
stay company- and person-agnostic.

## Coding protocol

- Extensions are TypeScript loaded via jiti; no build step.
- Host-provided packages (`@earendil-works/*`, `typebox`) go in
  `peerDependencies` with `"*"`; never in `dependencies`.
- Task cards are plain Markdown written with pi's native file tools;
  `skills/over-loop/SKILL.md` is the single source of the card format.

## Verify before committing

- Load test for extension changes: `pi -e ./extensions/index.ts`, or install
  into a consumer project and exercise `/over` end to end.
