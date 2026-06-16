import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { buildDesktopLangChainTools } from "../agent/tools";
import type { StepContext, StepEvent, StepExecutor } from "./types";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";
const RECURSION_LIMIT = 25;

type StreamEvent = {
  event?: string;
  data?: { chunk?: { content?: string } };
  run_id?: string;
  name?: string;
};

function buildMessages(ctx: StepContext) {
  const messages = [];
  if (ctx.systemPrompt) {
    messages.push(new SystemMessage(ctx.systemPrompt));
  }
  messages.push(new HumanMessage(ctx.userPrompt));
  return messages;
}

async function* mapStreamToStepEvents(
  stream: AsyncIterable<StreamEvent>,
): AsyncIterable<StepEvent> {
  for await (const event of stream) {
    if (event.event === "on_chat_model_stream") {
      const content = event.data?.chunk?.content;
      if (content) {
        yield { type: "message", content };
      }
    } else if (event.event === "on_tool_start") {
      yield {
        type: "tool_start",
        name: event.name ?? "",
        call_id: event.run_id ?? "",
      };
    } else if (event.event === "on_tool_end") {
      yield {
        type: "tool_end",
        name: event.name ?? "",
        call_id: event.run_id ?? "",
        ok: true,
      };
    }
  }
  yield { type: "done" };
}

export const deepseekExecutor: StepExecutor = {
  id: "deepseek",
  async *run(ctx: StepContext) {
    const model = new ChatOpenAI({
      model: "deepseek-chat",
      apiKey: ctx.apiKey,
      streaming: true,
      configuration: { baseURL: DEEPSEEK_BASE_URL },
    });

    const tools = buildDesktopLangChainTools({ workspaceRoot: ctx.workspaceRoot });
    const agent = createReactAgent({
      llm: model,
      tools,
      checkpointSaver: new MemorySaver(),
    });

    const stream = agent.streamEvents(
      { messages: buildMessages(ctx) },
      {
        version: "v2",
        configurable: { thread_id: `workflow:${ctx.threadId}:${ctx.stepId}` },
        recursionLimit: RECURSION_LIMIT,
      },
    );

    yield* mapStreamToStepEvents(stream);
  },
};
