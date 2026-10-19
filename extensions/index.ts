/**
 * over: Observe, Execute, Verify, Retro.
 *
 * The `/over <task>` command is the entry point: it triggers the OEVR loop
 * for a task by putting the agent in the coordinator role (procedure: the
 * over-loop and multi-agent skills). Task cards in ./.pi/tasks are the single
 * source of truth while worker context is volatile; they are plain Markdown
 * files the agent writes with pi's native file tools.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const TRIGGER_PROMPT = (task: string) => `${task}

---
Run this task through the over loop. You are the coordinator: read the over-loop skill now and follow it (read the multi-agent skill before your first dispatch). Do not write the implementation yourself. Escalate at the gates listed in the skill.`;

export default function (pi: ExtensionAPI) {
	pi.registerCommand("over", {
		description: "Run a task through the over loop: Observe → Execute → Verify → Retro",
		handler: async (args, ctx) => {
			const task = args.trim();
			if (!task) {
				ctx.ui.notify("Usage: /over <task description>", "info");
				return;
			}
			if (!process.env.HERDR_ENV) {
				ctx.ui.notify(
					"HERDR_ENV is not set, so worker dispatch via herdr is unavailable. The loop will run single-agent.",
					"warning",
				);
			}
			await pi.sendUserMessage(TRIGGER_PROMPT(task));
		},
	});
}
