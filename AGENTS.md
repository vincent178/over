# over

**over: Observe, Execute, Verify, Retro.**

The package supports single-agent and orchestrated execution.

The `extensions/` directory contains the `/over` command. The `skills/`
directory contains the loop procedure. See `README.md` for the package layout.

## Hard boundary

Keep `over` independent of operators and consuming projects.

Store employer, repository, and personal details in the consuming project.
This rule covers knowledge, task cards, identities, operational rules, and MCP
configuration. Never store those details in `over`.

Keep skills and extension code independent of companies and people.

## Coding protocol

- Pi loads TypeScript extensions through jiti. Do not add a build step.
- Declare host packages in `peerDependencies` with the `"*"` range.
- Never declare host packages in `dependencies`.
- Host packages include `@earendil-works/*` and `typebox`.
- Write task cards as plain Markdown with pi's native file tools.
- Use `skills/over-loop/SKILL.md` as the only task-card format definition.

## Installed copies are read-only

Edit only files in this repository. Never edit installed package copies under
`~/.pi/agent/git/...` or another installation directory.

Update installed copies through the normal commit, push, and pull flow.

## Verify before committing

- For extension changes, run `pi -e ./extensions/index.ts`.
- Alternatively, install the package in a consumer project. Run `/over` end to end.
