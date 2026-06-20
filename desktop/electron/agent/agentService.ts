import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import type { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { getProjectCheckpointer } from "../chatMemory/checkpointer";
import {
  buildDesktopLangChainTools,
  buildReadOnlyDesktopTools,
} from "./tools";
import { buildChatSystemPrompt, buildStepChatSystemPrompt, type ChatMode } from "./prompt";
import { getRecursionLimit } from "./recursionLimit";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

export type AgentConfig = {
  apiKey: string;
  workspaceRoot: string;
  projectRoot?: string;
  resourceServerUrl?: string | null;
};

export type ChatStreamOptions = {
  mode: ChatMode;
  skills?: string[];
  stepId?: string;
  workflowId?: string;
};

export class AgentService {
  private checkpointer: SqliteSaver | null = null;
  private checkpointerProjectRoot: string | null = null;
  private config: AgentConfig | null = null;
  private agents = new Map<ChatMode, ReturnType<typeof createReactAgent>>();

  private resolveProjectRoot(config: AgentConfig): string {
    return config.projectRoot ?? config.workspaceRoot;
  }

  private getCheckpointer(projectRoot: string): SqliteSaver {
    if (this.checkpointerProjectRoot !== projectRoot || !this.checkpointer) {
      this.checkpointerProjectRoot = projectRoot;
      this.checkpointer = getProjectCheckpointer(projectRoot);
    }
    return this.checkpointer;
  }

  configure(config: AgentConfig): void {
    const projectRoot = this.resolveProjectRoot(config);
    const prevProjectRoot = this.config ? this.resolveProjectRoot(this.config) : null;
    const unchanged =
      this.config?.apiKey === config.apiKey &&
      this.config?.workspaceRoot === config.workspaceRoot &&
      prevProjectRoot === projectRoot &&
      this.config?.resourceServerUrl === config.resourceServerUrl &&
      this.agents.size > 0;
    this.config = config;
    if (unchanged) return;

    const checkpointer = this.getCheckpointer(projectRoot);

    const model = new ChatOpenAI({
      model: "deepseek-chat",
      apiKey: config.apiKey,
      streaming: true,
      configuration: { baseURL: DEEPSEEK_BASE_URL },
    });

    const ctx = {
      workspaceRoot: config.workspaceRoot,
      resourceServerUrl: config.resourceServerUrl,
    };
    this.agents.clear();
    this.agents.set(
      "ask",
      createReactAgent({
        llm: model,
        tools: [],
        checkpointSaver: checkpointer,
      }),
    );
    this.agents.set(
      "plan",
      createReactAgent({
        llm: model,
        tools: buildReadOnlyDesktopTools(ctx),
        checkpointSaver: checkpointer,
      }),
    );
    this.agents.set(
      "agent",
      createReactAgent({
        llm: model,
        tools: buildDesktopLangChainTools(ctx),
        checkpointSaver: checkpointer,
      }),
    );
  }

  clear(): void {
    this.config = null;
    this.agents.clear();
    this.checkpointer = null;
    this.checkpointerProjectRoot = null;
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

  private resolveCheckpointThreadId(threadId: string, mode: ChatMode): string {
    if (threadId.includes(":")) {
      return threadId;
    }
    return `${mode}:${threadId}`;
  }

  async *streamEvents(
    threadId: string,
    message: string,
    options: ChatStreamOptions,
  ): AsyncGenerator<{ event: string; data?: Record<string, unknown>; name?: string; run_id?: string }> {
    const mode = options.mode;
    const agent = this.getAgent(mode);

    // 根据是否有 step context 选择 system prompt 构建方式
    let systemPrompt: string;
    if (options.stepId && options.workflowId) {
      systemPrompt = await buildStepChatSystemPrompt(
        mode,
        this.config!.workspaceRoot,
        options.stepId,
        options.workflowId,
        options.skills ?? [],
      );
    } else {
      systemPrompt = await buildChatSystemPrompt(
        mode,
        this.config!.workspaceRoot,
        options.skills ?? [],
      );
    }

    const input = {
      messages: [
        new HumanMessage(`${systemPrompt}\n\n---\n\n${message}`),
      ],
    };

    const events = agent.streamEvents(input, {
      version: "v2",
      configurable: { thread_id: this.resolveCheckpointThreadId(threadId, mode) },
      recursionLimit: getRecursionLimit(),
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
