/**
 * over: Observe, Execute, Verify, Retro.
 *
 * The over-loop skill defines the procedure. Task cards in ./.pi/tasks are
 * the source of truth. Pi's native file tools create and update task cards.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const TRIGGER_PROMPT = (task: string) => `${task}

---
Run this task through the over loop. Read the over-loop skill now. Follow its procedure. Use orchestrated execution when an orchestrator is available. Otherwise, use single-agent execution. Escalate at the defined gates.`;

export default function (pi: ExtensionAPI) {
	pi.registerCommand("over", {
		description: "Run a task through the over loop: Observe → Execute → Verify → Retro",
		handler: async (args, ctx) => {
			const task = args.trim();
			if (!task) {
				ctx.ui.notify("Usage: /over <task description>", "info");
				return;
			}
			await pi.sendUserMessage(TRIGGER_PROMPT(task));
		},
	});
}
