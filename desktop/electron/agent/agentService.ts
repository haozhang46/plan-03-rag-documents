import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {
  buildDesktopLangChainTools,
  buildReadOnlyDesktopTools,
} from "./tools";
import { buildChatSystemPrompt, type ChatMode } from "./prompt";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";
const RECURSION_LIMIT = 25;

export type AgentConfig = {
  apiKey: string;
  workspaceRoot: string;
};

export type ChatStreamOptions = {
  mode: ChatMode;
  skills?: string[];
};

export class AgentService {
  private checkpointer = new MemorySaver();
  private config: AgentConfig | null = null;
  private agents = new Map<ChatMode, ReturnType<typeof createReactAgent>>();

  configure(config: AgentConfig): void {
    const unchanged =
      this.config?.apiKey === config.apiKey &&
      this.config?.workspaceRoot === config.workspaceRoot &&
      this.agents.size > 0;
    this.config = config;
    if (unchanged) return;

    const model = new ChatOpenAI({
      model: "deepseek-chat",
      apiKey: config.apiKey,
      streaming: true,
      configuration: { baseURL: DEEPSEEK_BASE_URL },
    });

    const ctx = { workspaceRoot: config.workspaceRoot };
    this.agents.clear();
    this.agents.set(
      "ask",
      createReactAgent({
        llm: model,
        tools: [],
        checkpointSaver: this.checkpointer,
      }),
    );
    this.agents.set(
      "plan",
      createReactAgent({
        llm: model,
        tools: buildReadOnlyDesktopTools(ctx),
        checkpointSaver: this.checkpointer,
      }),
    );
    this.agents.set(
      "agent",
      createReactAgent({
        llm: model,
        tools: buildDesktopLangChainTools(ctx),
        checkpointSaver: this.checkpointer,
      }),
    );
  }

  clear(): void {
    this.config = null;
    this.agents.clear();
  }

  async probeDeepSeek(): Promise<void> {
    if (!this.config?.apiKey) throw new Error("API key not set");
    const model = new ChatOpenAI({
      model: "deepseek-chat",
      apiKey: this.config.apiKey,
      configuration: { baseURL: DEEPSEEK_BASE_URL },
    });
    await model.invoke([new HumanMessage("ping")]);
  }

  private getAgent(mode: ChatMode) {
    const agent = this.agents.get(mode);
    if (!agent || !this.config) {
      throw new Error("Agent not configured: set DeepSeek API key first");
    }
    return agent;
  }

  async *streamEvents(
    threadId: string,
    message: string,
    options: ChatStreamOptions,
  ): AsyncGenerator<{ event: string; data?: Record<string, unknown>; name?: string; run_id?: string }> {
    const mode = options.mode;
    const agent = this.getAgent(mode);
    const systemPrompt = await buildChatSystemPrompt(
      mode,
      this.config!.workspaceRoot,
      options.skills ?? [],
    );

    const input = {
      messages: [
        new HumanMessage(`${systemPrompt}\n\n---\n\n${message}`),
      ],
    };

    const events = agent.streamEvents(input, {
      version: "v2",
      configurable: { thread_id: `${mode}:${threadId}` },
      recursionLimit: RECURSION_LIMIT,
    });

    let assistantText = "";

    for await (const event of events) {
      yield event as { event: string; data?: Record<string, unknown>; name?: string; run_id?: string };
      if (event.event === "on_chat_model_stream") {
        const chunk = event.data?.chunk as { content?: string } | undefined;
        if (chunk?.content) {
          assistantText += chunk.content;
        }
      }
    }

    if (mode === "plan" && assistantText.trim()) {
      yield { event: "plan_ready", data: { content: assistantText.trim() } };
    }
  }
}

export const agentService = new AgentService();
