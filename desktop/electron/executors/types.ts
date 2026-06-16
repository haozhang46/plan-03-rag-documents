export interface StepContext {
  workspaceRoot: string;
  stepId: string;
  systemPrompt: string;
  userPrompt: string;
  threadId: string;
  apiKey: string;
}

export type StepEvent =
  | { type: "message"; content: string }
  | { type: "tool_start"; name: string; call_id: string }
  | { type: "tool_end"; name: string; call_id: string; ok: boolean }
  | { type: "done" };

export interface StepExecutor {
  id: string;
  run(ctx: StepContext): AsyncIterable<StepEvent>;
}
