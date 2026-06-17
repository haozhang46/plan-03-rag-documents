import http from "node:http";
import { agentService, type ChatMode } from "./agentService";
import { listSkillCatalog, listSkills } from "../skills/loader";
import {
  createWorkflowFromTemplate,
  deleteWorkflow,
  getActiveWorkflowId,
  listTemplates,
  listWorkflows,
  loadWorkflow,
  saveWorkflow,
} from "../workflow/loader";
import { compileAndWriteWorkflow } from "../workflow/compiler";
import {
  activateWorkflow,
  advanceWorkflow,
  clearRunner,
  compareWorkflowEvals,
  getDispatchDecision,
  getResourceContext,
  getWorkflowState,
  runWorkflowEval,
  runWorkflowGates,
  runWorkflowStep,
  setWorkflowIntent,
} from "../workflow/workflowService";
import { handleLangflowRoutes } from "../langflow/routes";
import { IntentSchema, RiskSchema, WorkflowSchema } from "../workflow/types";
import {
  workspaceDeletePath,
  workspaceDeploymentConfig,
  workspaceListDir,
  workspaceListFiles,
  workspaceReadFile,
  workspaceReadGates,
  workspaceReadPhase,
  workspaceWriteFile,
} from "../workspace/service";

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

function parseQuery(url: string): URLSearchParams {
  const idx = url.indexOf("?");
  return new URLSearchParams(idx >= 0 ? url.slice(idx + 1) : "");
}

function workflowIdFromQuery(reqUrl: string | undefined): string | undefined {
  const id = parseQuery(reqUrl ?? "").get("workflowId");
  return id && id.trim() ? id.trim() : undefined;
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
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = req.url?.split("?")[0];

    if (
      await handleLangflowRoutes(req, res, url ?? "", req.method ?? "GET", getWorkspaceRoot)
    ) {
      return;
    }

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

    if (req.method === "GET" && url === "/v1/workflows") {
      try {
        const workspaceRoot = getWorkspaceRoot();
        const workflows = await listWorkflows(workspaceRoot);
        const activeWorkflowId = await getActiveWorkflowId(workspaceRoot);
        jsonResponse(res, 200, {
          workflows: workflows.map((w) => ({
            ...w,
            isActive: w.id === activeWorkflowId,
          })),
          activeWorkflowId,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "GET" && url === "/v1/workflows/templates") {
      try {
        const templates = await listTemplates();
        jsonResponse(res, 200, { templates });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "POST" && url === "/v1/workflows/from-template") {
      let payload: { templateId?: string; newId?: string };
      try {
        payload = JSON.parse(await readBody(req));
      } catch {
        jsonResponse(res, 400, { detail: "invalid JSON" });
        return;
      }
      if (!payload.templateId) {
        jsonResponse(res, 400, { detail: "templateId required" });
        return;
      }
      try {
        const workspaceRoot = getWorkspaceRoot();
        const workflowId = await createWorkflowFromTemplate(
          workspaceRoot,
          payload.templateId,
          payload.newId,
        );
        jsonResponse(res, 201, { workflowId });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    const workflowActivateMatch = url?.match(/^\/v1\/workflows\/([^/]+)\/activate$/);
    if (req.method === "POST" && workflowActivateMatch) {
      const workflowId = decodeURIComponent(workflowActivateMatch[1]);
      try {
        await activateWorkflow(
          getWorkspaceRoot(),
          workflowId,
          getApiKey,
          getResourceServerUrl,
        );
        jsonResponse(res, 200, { workflowId, active: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    const workflowIdMatch = url?.match(/^\/v1\/workflows\/([^/]+)$/);
    if (req.method === "PUT" && workflowIdMatch) {
      const workflowId = decodeURIComponent(workflowIdMatch[1]);
      let payload: unknown;
      try {
        payload = JSON.parse(await readBody(req));
      } catch {
        jsonResponse(res, 400, { detail: "invalid JSON" });
        return;
      }
      try {
        const definition = WorkflowSchema.parse(payload);
        if (definition.id !== workflowId) {
          jsonResponse(res, 400, { detail: "workflow id mismatch" });
          return;
        }
        await saveWorkflow(getWorkspaceRoot(), workflowId, definition);
        clearRunner(getWorkspaceRoot(), workflowId);
        jsonResponse(res, 200, definition);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "DELETE" && workflowIdMatch) {
      const workflowId = decodeURIComponent(workflowIdMatch[1]);
      try {
        await deleteWorkflow(getWorkspaceRoot(), workflowId);
        jsonResponse(res, 200, { deleted: workflowId });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 400, { detail: message });
      }
      return;
    }

    if (req.method === "GET" && url === "/v1/workflows/current") {
      try {
        const workflowId = workflowIdFromQuery(req.url);
        const workflow = await loadWorkflow(getWorkspaceRoot(), workflowId);
        jsonResponse(res, 200, workflow);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "GET" && url === "/v1/workflow/dispatch") {
      try {
        const workflowId = workflowIdFromQuery(req.url);
        const decision = await getDispatchDecision(
          getWorkspaceRoot(),
          getApiKey,
          getResourceServerUrl,
          workflowId,
        );
        jsonResponse(res, 200, decision);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "POST" && url === "/v1/workflow/intent") {
      let payload: { intent?: string; risk?: string; workflowId?: string };
      try {
        payload = JSON.parse(await readBody(req));
      } catch {
        jsonResponse(res, 400, { detail: "invalid JSON" });
        return;
      }

      const intent = IntentSchema.safeParse(payload.intent);
      const risk = RiskSchema.safeParse(payload.risk);
      if (!intent.success || !risk.success) {
        jsonResponse(res, 400, { detail: "intent and risk required (valid enum values)" });
        return;
      }

      try {
        const state = await setWorkflowIntent(
          getWorkspaceRoot(),
          getApiKey,
          intent.data,
          risk.data,
          getResourceServerUrl,
          payload.workflowId,
        );
        jsonResponse(res, 200, state);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "POST" && url === "/v1/workflow/gates") {
      let payload: { stepId?: string; workflowId?: string } = {};
      try {
        const raw = await readBody(req);
        if (raw.trim()) {
          payload = JSON.parse(raw);
        }
      } catch {
        jsonResponse(res, 400, { detail: "invalid JSON" });
        return;
      }

      try {
        const state = await runWorkflowGates(
          getWorkspaceRoot(),
          getApiKey,
          payload.stepId,
          getResourceServerUrl,
          payload.workflowId,
        );
        jsonResponse(res, 200, state);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "POST" && url === "/v1/eval/run") {
      try {
        const workflowId = workflowIdFromQuery(req.url);
        const report = await runWorkflowEval(
          getWorkspaceRoot(),
          getApiKey,
          getResourceServerUrl,
          workflowId,
        );
        jsonResponse(res, 200, report);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "POST" && url === "/v1/eval/compare") {
      let payload: { baseline?: unknown; candidate?: unknown };
      try {
        payload = JSON.parse(await readBody(req));
      } catch {
        jsonResponse(res, 400, { detail: "invalid JSON" });
        return;
      }

      if (!payload.baseline || !payload.candidate) {
        jsonResponse(res, 400, { detail: "baseline and candidate eval reports required" });
        return;
      }

      try {
        const comparison = compareWorkflowEvals(
          payload.baseline as Parameters<typeof compareWorkflowEvals>[0],
          payload.candidate as Parameters<typeof compareWorkflowEvals>[1],
        );
        jsonResponse(res, 200, comparison);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "GET" && url === "/v1/workflow/state") {
      try {
        const workflowId = workflowIdFromQuery(req.url);
        const state = await getWorkflowState(
          getWorkspaceRoot(),
          getApiKey,
          getResourceServerUrl,
          workflowId,
        );
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

    if (req.method === "GET" && url?.startsWith("/v1/workspace/list")) {
      const query = parseQuery(req.url ?? "");
      const relPath = query.get("path") ?? "";
      const recursive = query.get("recursive") === "1";
      try {
        const entries = recursive
          ? await workspaceListFiles(getWorkspaceRoot(), relPath)
          : await workspaceListDir(getWorkspaceRoot(), relPath);
        jsonResponse(res, 200, { path: relPath, entries });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 400, { detail: message });
      }
      return;
    }

    if (req.method === "GET" && url?.startsWith("/v1/workspace/file")) {
      const query = parseQuery(req.url ?? "");
      const relPath = query.get("path");
      if (!relPath) {
        jsonResponse(res, 400, { detail: "path query required" });
        return;
      }
      try {
        const file = await workspaceReadFile(getWorkspaceRoot(), relPath);
        jsonResponse(res, 200, file);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 400, { detail: message });
      }
      return;
    }

    if (req.method === "PUT" && url === "/v1/workspace/file") {
      let payload: { path?: string; content?: string };
      try {
        payload = JSON.parse(await readBody(req));
      } catch {
        jsonResponse(res, 400, { detail: "invalid JSON" });
        return;
      }
      if (!payload.path || payload.content === undefined) {
        jsonResponse(res, 400, { detail: "path and content required" });
        return;
      }
      try {
        const result = await workspaceWriteFile(
          getWorkspaceRoot(),
          payload.path,
          payload.content,
        );
        jsonResponse(res, 200, result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 400, { detail: message });
      }
      return;
    }

    if (req.method === "DELETE" && url?.startsWith("/v1/workspace/file")) {
      const query = parseQuery(req.url ?? "");
      const relPath = query.get("path");
      if (!relPath) {
        jsonResponse(res, 400, { detail: "path query required" });
        return;
      }
      try {
        const result = await workspaceDeletePath(getWorkspaceRoot(), relPath);
        jsonResponse(res, 200, result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 400, { detail: message });
      }
      return;
    }

    if (req.method === "GET" && url?.startsWith("/v1/workflow/phase")) {
      const query = parseQuery(req.url ?? "");
      const stepId = query.get("stepId");
      if (!stepId) {
        jsonResponse(res, 400, { detail: "stepId query required" });
        return;
      }
      try {
        const phase = await workspaceReadPhase(getWorkspaceRoot(), stepId);
        jsonResponse(res, 200, phase);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "GET" && url?.startsWith("/v1/workflow/gates")) {
      const query = parseQuery(req.url ?? "");
      const stepId = query.get("stepId");
      if (!stepId) {
        jsonResponse(res, 400, { detail: "stepId query required" });
        return;
      }
      try {
        const gates = await workspaceReadGates(getWorkspaceRoot(), stepId);
        jsonResponse(res, 200, gates);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "GET" && url === "/v1/workspace/deployment") {
      try {
        const config = await workspaceDeploymentConfig(getWorkspaceRoot(), getResourceServerUrl);
        jsonResponse(res, 200, config);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "GET" && url === "/v1/skills") {
      try {
        const detailed = parseQuery(req.url ?? "").get("detailed");
        if (detailed === "1") {
          const skills = await listSkillCatalog();
          jsonResponse(res, 200, skills);
        } else {
          const skills = await listSkills();
          jsonResponse(res, 200, skills);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        jsonResponse(res, 500, { detail: message });
      }
      return;
    }

    if (req.method === "POST" && url === "/v1/workflow/advance") {
      let payload: { action?: string; workflowId?: string };
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
        const state = await advanceWorkflow(
          getWorkspaceRoot(),
          getApiKey,
          action,
          getResourceServerUrl,
          payload.workflowId,
        );
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
      let payload: { stepId?: string; workflowId?: string } = {};
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
          payload.workflowId,
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

      let payload: {
        flow_id?: string;
        thread_id?: string;
        message?: string;
        mode?: string;
        skills?: string[];
      };
      try {
        payload = JSON.parse(await readBody(req));
      } catch {
        jsonResponse(res, 400, { detail: "invalid JSON" });
        return;
      }

      let mode: ChatMode = "agent";
      if (payload.mode === "ask" || payload.mode === "plan" || payload.mode === "agent") {
        mode = payload.mode;
      } else if (payload.flow_id === "general-react") {
        mode = "agent";
      } else if (payload.flow_id) {
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
        const events = agentService.streamEvents(payload.thread_id, payload.message, {
          mode,
          skills: payload.skills,
        });
        for await (const event of events) {
          if (event.event === "plan_ready") {
            writeSse(res, "plan_ready", event.data ?? {});
            continue;
          }
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
