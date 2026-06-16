import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { buildDesktopLangChainTools } from "./tools";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";
const RECURSION_LIMIT = 25;

export type AgentConfig = {
  apiKey: string;
  workspaceRoot: string;
};

export class AgentService {
  private checkpointer = new MemorySaver();
  private config: AgentConfig | null = null;
  private agent: ReturnType<typeof createReactAgent> | null = null;

  configure(config: AgentConfig): void {
    const unchanged =
      this.config?.apiKey === config.apiKey &&
      this.config?.workspaceRoot === config.workspaceRoot &&
      this.agent !== null;
    this.config = config;
    if (unchanged) return;

    const model = new ChatOpenAI({
      model: "deepseek-chat",
      apiKey: config.apiKey,
      streaming: true,
      configuration: { baseURL: DEEPSEEK_BASE_URL },
    });

    const tools = buildDesktopLangChainTools({ workspaceRoot: config.workspaceRoot });
    this.agent = createReactAgent({
      llm: model,
      tools,
      checkpointSaver: this.checkpointer,
    });
  }

  clear(): void {
    this.config = null;
    this.agent = null;
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

  streamEvents(threadId: string, message: string) {
    if (!this.agent || !this.config) {
      throw new Error("Agent not configured: set DeepSeek API key first");
    }
    return this.agent.streamEvents(
      { messages: [new HumanMessage(message)] },
      {
        version: "v2",
        configurable: { thread_id: `general-react:${threadId}` },
        recursionLimit: RECURSION_LIMIT,
      },
    );
  }
}

export const agentService = new AgentService();
