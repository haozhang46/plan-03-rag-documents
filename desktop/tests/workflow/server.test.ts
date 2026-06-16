import http from "node:http";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("electron", () => ({
  dialog: {
    showMessageBox: vi.fn().mockResolvedValue({ response: 1 }),
  },
}));

import { startAgentServer } from "../../electron/agent/server";
import { initProjectFromTemplate } from "../../electron/workflow/loader";

function request(
  port: number,
  method: string,
  urlPath: string,
  body?: string,
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        method,
        path: urlPath,
        headers: body
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(body),
            }
          : {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body: data }));
      },
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function listenPort(server: http.Server): Promise<number> {
  return new Promise((resolve, reject) => {
    server.on("listening", () => {
      const addr = server.address();
      if (typeof addr === "object" && addr) {
        resolve(addr.port);
      } else {
        reject(new Error("server address unavailable"));
      }
    });
    server.on("error", reject);
  });
}

describe("agent server workflow API", () => {
  let tmp: string;
  let server: http.Server;
  let port: number;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "af-srv-"));
    await initProjectFromTemplate(tmp, "default-dev-cicd");
    server = startAgentServer({
      port: 0,
      getApiKey: () => "test-key",
      getWorkspaceRoot: () => tmp,
    });
    port = await listenPort(server);
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it("GET /v1/skills returns skill list", async () => {
    const res = await request(port, "GET", "/v1/skills");
    expect(res.status).toBe(200);
    const skills = JSON.parse(res.body) as string[];
    expect(Array.isArray(skills)).toBe(true);
    expect(skills.length).toBeGreaterThan(0);
    expect(skills).toContain("test-driven-development");
  });

  it("GET /v1/workflows/current returns workflow definition", async () => {
    const res = await request(port, "GET", "/v1/workflows/current");
    expect(res.status).toBe(200);
    const wf = JSON.parse(res.body) as { id: string; steps: unknown[] };
    expect(wf.id).toBe("default-dev-cicd");
    expect(wf.steps.length).toBeGreaterThan(0);
  });

  it("GET /v1/workflow/state returns initial run state", async () => {
    const res = await request(port, "GET", "/v1/workflow/state");
    expect(res.status).toBe(200);
    const state = JSON.parse(res.body) as { workflowId: string; currentStepId: string };
    expect(state.workflowId).toBe("default-dev-cicd");
    expect(state.currentStepId).toBe("prd");
  });

  it("GET /v1/resources/context returns resolved resources", async () => {
    const res = await request(port, "GET", "/v1/resources/context");
    expect(res.status).toBe(200);
    const context = JSON.parse(res.body) as {
      markdown: string;
      resources: Array<{ type: string; name: string }>;
    };
    expect(context.resources.length).toBeGreaterThan(0);
    expect(context.resources.some((r) => r.name === "app-db")).toBe(true);
    expect(context.markdown).toContain("## Available Server Resources");
  });
});
