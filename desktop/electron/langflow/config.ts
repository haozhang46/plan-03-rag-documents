import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { LangflowConfig } from "./types";

const DEFAULT_BASE_URL = "http://127.0.0.1:7860";

export async function getLangflowConfig(): Promise<LangflowConfig> {
  const settingsPath = path.join(os.homedir(), ".agentflow/settings.json");
  try {
    const raw = await fs.readFile(settingsPath, "utf8");
    const parsed = JSON.parse(raw) as {
      langflowBaseUrl?: string;
      langflowApiKey?: string;
    };
    return {
      baseUrl: (parsed.langflowBaseUrl?.trim() || DEFAULT_BASE_URL).replace(/\/$/, ""),
      apiKey: parsed.langflowApiKey?.trim() ?? "",
    };
  } catch {
    return { baseUrl: DEFAULT_BASE_URL, apiKey: "" };
  }
}
