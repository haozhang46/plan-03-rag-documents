import { spawn } from "node:child_process";
import type { StepContext, StepEvent, StepExecutor } from "./types";

async function* runClaude(ctx: StepContext): AsyncIterable<StepEvent> {
  const child = spawn("claude", ["--print", ctx.userPrompt], {
    cwd: ctx.workspaceRoot,
    env: process.env,
  });

  const pending: StepEvent[] = [];
  let finished = false;
  let wake: (() => void) | undefined;

  const push = (event: StepEvent) => {
    pending.push(event);
    wake?.();
  };

  child.on("error", (err) => {
    push({ type: "message", content: `Error: ${err.message}` });
    push({ type: "done" });
    finished = true;
  });

  child.stdout.on("data", (chunk: Buffer) => {
    for (const line of chunk.toString().split("\n")) {
      if (line.length > 0) {
        push({ type: "message", content: `${line}\n` });
      }
    }
  });

  child.on("close", () => {
    if (!finished) {
      push({ type: "done" });
      finished = true;
    }
  });

  while (!finished || pending.length > 0) {
    if (pending.length === 0) {
      await new Promise<void>((resolve) => {
        wake = resolve;
      });
      continue;
    }
    yield pending.shift()!;
  }
}

export const claudeCodeExecutor: StepExecutor = {
  id: "claude-code",
  run(ctx: StepContext): AsyncIterable<StepEvent> {
    return runClaude(ctx);
  },
};
