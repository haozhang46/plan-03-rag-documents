# Electron Service Logger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a lightweight, zero-dependency logging system for Electron HTTP services (Agent Server port 8765, Executor Server port 17351) with request tracking, startup logging, and error capture.

**Architecture:** Custom logger module writing to `~/.agentflow/logs/YYYY-MM-DD.log` with timestamped entries, HTTP middleware for automatic request/response logging with duration, and global error boundary for stack trace capture.

**Tech Stack:** TypeScript, Node.js fs module, Electron main process

---

## File Structure

| File | Type | Responsibility |
|------|------|--------------|
| `desktop/electron/utils/logger.ts` | Create | Core logger with file rotation, timestamp formatting, log levels |
| `desktop/electron/agent/server.ts` | Modify | Integrate request logging middleware, startup log, error boundary |
| `desktop/electron/executor/server.ts` | Modify | Integrate request logging, startup log, error boundary |

---

## Task 1: Core Logger Module

**Files:**
- Create: `desktop/electron/utils/logger.ts`

- [ ] **Step 1: Create logger directory structure and types**

```typescript
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const LOG_DIR = path.join(os.homedir(), ".agentflow", "logs");

type LogLevel = "INFO" | "WARN" | "ERROR" | "REQUEST" | "STARTUP";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
}
```

- [ ] **Step 2: Implement log file rotation and write function**

```typescript
function getTodayLogFile(): string {
  const date = new Date().toISOString().split("T")[0];
  return path.join(LOG_DIR, `${date}.log`);
}

async function ensureLogDir(): Promise<void> {
  await fs.mkdir(LOG_DIR, { recursive: true });
}

async function writeLog(entry: LogEntry): Promise<void> {
  await ensureLogDir();
  const logFile = getTodayLogFile();
  const line = `[${entry.timestamp}] [${entry.level}] ${entry.message}`;
  const meta = entry.meta ? ` ${JSON.stringify(entry.meta)}` : "";
  await fs.appendFile(logFile, `${line}${meta}\n`, "utf-8");
}
```

- [ ] **Step 3: Implement public logger interface**

```typescript
function formatTimestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    void writeLog({ timestamp: formatTimestamp(), level: "INFO", message, meta });
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    void writeLog({ timestamp: formatTimestamp(), level: "WARN", message, meta });
  },

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    const errorMeta = error ? { stack: error.stack, ...meta } : meta;
    void writeLog({ timestamp: formatTimestamp(), level: "ERROR", message, meta: errorMeta });
  },

  request(method: string, url: string, statusCode: number, durationMs: number): void {
    void writeLog({
      timestamp: formatTimestamp(),
      level: "REQUEST",
      message: `${method} ${url} ${statusCode} ${durationMs}ms`,
      meta: { method, url, statusCode, durationMs },
    });
  },

  startup(service: string, port: number): void {
    void writeLog({
      timestamp: formatTimestamp(),
      level: "STARTUP",
      message: `${service} server starting on port ${port}`,
      meta: { service, port },
    });
  },
};
```

- [ ] **Step 4: Commit**

```bash
git add desktop/electron/utils/logger.ts
git commit -m "feat: add lightweight file logger for electron services"
```

---

## Task 2: Agent Server Logging Integration

**Files:**
- Modify: `desktop/electron/agent/server.ts` (import section, startAgentServer function, error handlers)

- [ ] **Step 1: Add logger import and startup log**

```typescript
// Add to imports (after existing imports)
import { logger } from "../utils/logger";

// In startAgentServer function, after server creation
export function startAgentServer(options: AgentServerOptions): http.Server {
  const { port, getApiKey, getWorkspaceRoot, getResourceServerUrl } = options;

  // Log startup
  logger.startup("Agent", port);

  // ... rest of function
```

- [ ] **Step 2: Add request logging middleware**

```typescript
// In startAgentServer, before request handlers
  const server = http.createServer(async (req, res) => {
    const startTime = Date.now();
    const method = req.method || "GET";
    const url = req.url || "/";

    // Capture original end to intercept status code
    const originalEnd = res.end.bind(res);
    res.end = (...args: unknown[]) => {
      const duration = Date.now() - startTime;
      logger.request(method, url, res.statusCode || 200, duration);
      return originalEnd(...args);
    };

    res.setHeader("Access-Control-Allow-Origin", "*");
    // ... rest of CORS headers
```

- [ ] **Step 3: Add error boundary logging**

```typescript
// At the top of startAgentServer, wrap the createServer callback
  const server = http.createServer(async (req, res) => {
    try {
      // ... existing request handling logic
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("Unhandled request error", error, { url: req.url, method: req.method });

      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ detail: "Internal server error" }));
      }
    }
  });
```

- [ ] **Step 4: Add specific error logging to critical paths**

```typescript
// In syncAgent function or where errors occur
function syncAgent(): boolean {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      logger.warn("API key not configured, clearing agent service");
      agentService.clear();
      return false;
    }
    agentService.configure({
      apiKey,
      workspaceRoot: getWorkspaceRoot(),
      projectRoot: getWorkspaceRoot(),
      resourceServerUrl: getResourceServerUrl?.() ?? null,
    });
    return true;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("Failed to sync agent", error);
    return false;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add desktop/electron/agent/server.ts
git commit -m "feat: add request and error logging to agent server"
```

---

## Task 3: Executor Server Logging Integration

**Files:**
- Modify: `desktop/electron/executor/server.ts`

- [ ] **Step 1: Add logger import and startup log**

```typescript
// Add to imports
import { logger } from "../utils/logger";

export function startExecutorServer(port = 17351): http.Server {
  // Log startup
  logger.startup("Executor", port);

  const server = http.createServer(async (req, res) => {
```

- [ ] **Step 2: Add request logging middleware**

```typescript
  const server = http.createServer(async (req, res) => {
    const startTime = Date.now();
    const method = req.method || "GET";
    const url = req.url || "/";

    // Capture original end
    const originalEnd = res.end.bind(res);
    res.end = (...args: unknown[]) => {
      const duration = Date.now() - startTime;
      logger.request(method, url, res.statusCode || 200, duration);
      return originalEnd(...args);
    };

    if (req.method !== "POST" || req.url !== "/v1/tool") {
      res.writeHead(404);
      res.end();
      return;
    }
```

- [ ] **Step 3: Add error logging to tool execution**

```typescript
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body) as ToolRequest;
        logger.info("Executing tool", { tool: payload.name, callId: payload.call_id });
        const output = await handleTool(payload);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, output }));
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("Tool execution failed", error, { body: body.slice(0, 1000) });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
```

- [ ] **Step 4: Add global error handler**

```typescript
  server.on("error", (err) => {
    logger.error("Executor server error", err);
  });

  server.listen(port, "127.0.0.1", () => {
    logger.info("Executor server listening", { port, address: "127.0.0.1" });
  });
  return server;
```

- [ ] **Step 5: Commit**

```bash
git add desktop/electron/executor/server.ts
git commit -m "feat: add request and error logging to executor server"
```

---

## Task 4: Main Process Error Logging

**Files:**
- Modify: `desktop/electron/main.ts`

- [ ] **Step 1: Add logger import for main process errors**

```typescript
// Add to imports
import { logger } from "./utils/logger";

// Add to app.whenReady() or top level
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception in main process", err);
  // Optionally: show dialog, exit gracefully
});

process.on("unhandledRejection", (reason) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logger.error("Unhandled rejection in main process", error);
});
```

- [ ] **Step 2: Log server lifecycle events**

```typescript
// In restartAgentServer function
function restartAgentServer(): void {
  logger.info("Restarting agent server");
  if (agentServer) {
    agentServer.close();
    agentServer = null;
  }
  agentServer = startAgentServer({
    port: AGENT_PORT,
    getApiKey: loadApiKey,
    getWorkspaceRoot: () => workspaceRoot,
    getResourceServerUrl: () => resourceServerUrl,
  });
  logger.info("Agent server restarted");
}
```

- [ ] **Step 3: Commit**

```bash
git add desktop/electron/main.ts
git commit -m "feat: add main process error logging and lifecycle events"
```

---

## Task 5: Test and Verify

- [ ] **Step 1: Build and run the application**

```bash
cd desktop
pnpm build
pnpm dev
```

- [ ] **Step 2: Verify log file creation**

```bash
# Check log file exists
ls -la ~/.agentflow/logs/

# View log contents
cat ~/.agentflow/logs/$(date +%Y-%m-%d).log
```

- [ ] **Step 3: Verify log entries**

Expected log entries:
```
[2024-06-20T17:20:30.123Z] [STARTUP] Agent server starting on port 8765
[2024-06-20T17:20:30.456Z] [STARTUP] Executor server starting on port 17351
[2024-06-20T17:20:35.789Z] [REQUEST] POST /v1/chat 200 1234ms
[2024-06-20T17:20:36.012Z] [INFO] Executing tool {"tool":"read_file","callId":"abc123"}
```

- [ ] **Step 4: Commit test verification**

```bash
git commit --allow-empty -m "test: verify electron service logger works correctly"
```

---

## Self-Review Checklist

- [ ] **Log rotation:** Daily log files in `~/.agentflow/logs/`
- [ ] **Zero dependencies:** Only Node.js built-in modules used
- [ ] **Async fire-and-forget:** Logger calls don't block request handling
- [ ] **Error safety:** Logger errors don't crash the server
- [ ] **Privacy:** No sensitive data (API keys, file contents) in logs

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-06-20-electron-service-logger.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
