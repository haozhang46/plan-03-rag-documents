import http from "node:http";
import { agentService } from "./agentService";
import { listSkills } from "../skills/loader";
import { loadWorkflow } from "../workflow/loader";
import { compileAndWriteWorkflow } from "../workflow/compiler";
import {
  advanceWorkflow,
  clearRunner,
  getResourceContext,
  getWorkflowState,
  runWorkflowStep,
} from "../workflow/workflowService";

export type AgentServerOptions = {
  port: number;
  getApiKey: () => string | null;
  getWorkspaceRoot: () => string;
  getResourceServerUrl?: () => string | null;
};

function writeSse(res: http.ServerResponse, event: string, data: unknown): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function jsonResponse(res: http.ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

export function startAgentServer(options: AgentServerOptions): http.Server {
  const { port, getApiKey, getWorkspaceRoot, getResourceServerUrl } = options;

  function syncAgent(): boolean {
    const apiKey = getApiKey();
    if (!apiKey) {
      agentService.clear();
      return false;
    }
    agentService.configure({ apiKey, workspaceRoot: getWorkspaceRoot() });
    return true;
  }

  const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = req.url?.split("?")[0];

    if (req.method === "GET" && url === "/health") {
      jsonResponse(res, 200, { status: "ok", mode: "desktop-js" });
      return;
    }

    if (req.method === "GET" && url === "/v1/health/deepseek") {
      if (!syncAgent()) {
        jsonResponse(res, 400, { detail: "DEEPSEEK_API_KEY not set" });
        return;
      }
      try {
        await agentService.probeDeepSeek();
        jsonResponse(res, 200, { status: "ok", provider: "deepseek" });
      } catch (err) {
        const name = err instanceof Error ? err.constructor.name : "Error";
        jsonResponse(res, 502, { detail: `DeepSeek probe failed: ${name}` });
      }
      return;
    }

    if (req.method === "GET" && url === "/v1/workflows/current") {
      try {
        const workflow = await loadWorkflow(getWorkspaceRoot());
        jsonResponse(res, 200, workflow);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "GET" && url === "/v1/workflow/state") {
      try {
        const state = await getWorkflowState(getWorkspaceRoot(), getApiKey, getResourceServerUrl);
        jsonResponse(res, 200, state);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "GET" && url === "/v1/resources/context") {
      try {
        const context = await getResourceContext(getWorkspaceRoot(), getResourceServerUrl);
        jsonResponse(res, 200, context);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "GET" && url === "/v1/skills") {
      try {
        const skills = await listSkills();
        jsonResponse(res, 200, skills);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "POST" && url === "/v1/workflow/advance") {
      let payload: { action?: string };
      try {
        payload = JSON.parse(await readBody(req));
      } catch {
        jsonResponse(res, 400, { detail: "invalid JSON" });
        return;
      }

      const action = payload.action;
      if (action !== "continue" && action !== "skip" && action !== "retry") {
        jsonResponse(res, 400, { detail: 'action must be "continue", "skip", or "retry"' });
        return;
      }

      try {
        const state = await advanceWorkflow(getWorkspaceRoot(), getApiKey, action, getResourceServerUrl);
        jsonResponse(res, 200, state);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "POST" && url === "/v1/workflow/compile") {
      let payload: { langflowJson?: unknown };
      try {
        payload = JSON.parse(await readBody(req));
      } catch {
        jsonResponse(res, 400, { detail: "invalid JSON" });
        return;
      }

      if (!payload.langflowJson || typeof payload.langflowJson !== "object") {
        jsonResponse(res, 400, { detail: "langflowJson object required" });
        return;
      }

      try {
        const workspaceRoot = getWorkspaceRoot();
        const workflow = await compileAndWriteWorkflow(
          workspaceRoot,
          payload.langflowJson as Parameters<typeof compileAndWriteWorkflow>[1],
        );
        clearRunner(workspaceRoot);
        jsonResponse(res, 200, workflow);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "POST" && url === "/v1/workflow/run") {
      let payload: { stepId?: string } = {};
      try {
        const raw = await readBody(req);
        if (raw.trim()) {
          payload = JSON.parse(raw);
        }
      } catch {
        jsonResponse(res, 400, { detail: "invalid JSON" });
        return;
      }

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      try {
        const events = runWorkflowStep(
          getWorkspaceRoot(),
          getApiKey,
          payload.stepId,
          getResourceServerUrl,
        );
        for await (const event of events) {
          writeSse(res, event.type, event);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        writeSse(res, "message", { type: "message", content: `Error: ${message}` });
        writeSse(res, "done", { type: "done" });
      }
      res.end();
      return;
    }

    if (req.method === "POST" && url === "/v1/chat") {
      if (!syncAgent()) {
        jsonResponse(res, 400, { detail: "DEEPSEEK_API_KEY not set" });
        return;
      }

      let payload: { flow_id?: string; thread_id?: string; message?: string };
      try {
        payload = JSON.parse(await readBody(req));
      } catch {
        jsonResponse(res, 400, { detail: "invalid JSON" });
        return;
      }

      if (payload.flow_id !== "general-react") {
        jsonResponse(res, 400, { detail: `unknown flow_id: ${payload.flow_id}` });
        return;
      }
      if (!payload.thread_id || !payload.message) {
        jsonResponse(res, 400, { detail: "thread_id and message required" });
        return;
      }

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      try {
        const events = agentService.streamEvents(payload.thread_id, payload.message);
        for await (const event of events) {
          if (event.event === "on_chat_model_stream") {
            const chunk = event.data?.chunk as { content?: string } | undefined;
            if (chunk?.content) {
              writeSse(res, "message", { content: chunk.content });
            }
          } else if (event.event === "on_tool_start") {
            writeSse(res, "tool_start", {
              call_id: event.run_id ?? "",
              name: event.name ?? "",
            });
          } else if (event.event === "on_tool_end") {
            writeSse(res, "tool_end", {
              call_id: event.run_id ?? "",
              name: event.name ?? "",
              ok: true,
            });
          }
        }
        writeSse(res, "done", {});
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        writeSse(res, "message", { content: `\n\nError: ${message}` });
        writeSse(res, "done", {});
      }
      res.end();
      return;
    }

    res.writeHead(404);
    res.end();
  });

  server.listen(port, "127.0.0.1");
  return server;
}
