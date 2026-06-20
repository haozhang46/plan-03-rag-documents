# Step Chat 使用 /v1/chat API 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 Step Chat 用户消息被忽略的问题，让 Step Chat 使用 `/v1/chat` API（带 step context），而不是忽略用户输入的 `runStep`

**架构:** 扩展 `/v1/chat` 接口接收 `stepId`/`workflowId`，在 system prompt 中注入 step context（workspace 信息、step skills、历史状态），前端 Step Chat 改为调用 `/v1/chat`

**Tech Stack:** TypeScript, Electron (Node.js HTTP server), LangChain, Vue 3

---

## 问题背景

当前 Step Chat 调用 `POST /v1/workflow/run`，但：
- 前端传了 `message` 参数
- 后端完全忽略 `message`，执行预定义的 workflow step
- 用户体验：用户输入被忽略，AI 执行固定 prompt

**解决方案：** Step Chat 改为调用 `/v1/chat`，但带上 step context

---

## 文件结构

| 文件 | 修改类型 | 职责 |
|-----|---------|------|
| `desktop/electron/agent/server.ts` | 修改 | 扩展 `/v1/chat` 路由，解析 `stepId`/`workflowId`，构建带 context 的 system prompt |
| `desktop/electron/agent/agentService.ts` | 修改 | 添加 `streamEventsWithContext` 方法，支持传入 system prompt context |
| `desktop/electron/agent/prompt.ts` | 修改 | 添加 `buildStepChatSystemPrompt` 函数，构建含 step info 的 prompt |
| `desktop/src/composables/useWorkflow.ts` | 修改 | 添加 `stepChat` 函数，调用 `/v1/chat` 而非 `runStep` |
| `desktop/src/pages/WorkflowRun.vue` | 修改 | Step Chat 发送逻辑改用新的 `stepChat` 函数 |

---

## Task 1: Backend - 扩展 `/v1/chat` 接收 step 参数

**Files:**
- Modify: `desktop/electron/agent/server.ts:1458-1464` (payload 类型定义)
- Modify: `desktop/electron/agent/server.ts:1470-1484` (参数校验)
- Modify: `desktop/electron/agent/server.ts:1492-1520` (调用 agentService)

- [ ] **Step 1: 扩展 payload 类型定义**

```typescript
// 修改前
let payload: {
  flow_id?: string;
  thread_id?: string;
  message?: string;
  mode?: string;
  skills?: string[];
};

// 修改后
let payload: {
  flow_id?: string;
  thread_id?: string;
  message?: string;
  mode?: string;
  skills?: string[];
  stepId?: string;      // 新增
  workflowId?: string;  // 新增
};
```

- [ ] **Step 2: 修改 agentService.streamEvents 调用，传入 step context**

```typescript
// 在 server.ts 第 1493 行附近
const events = agentService.streamEvents(payload.thread_id, payload.message, {
  mode,
  skills: payload.skills,
  stepId: payload.stepId,        // 新增
  workflowId: payload.workflowId, // 新增
});
```

- [ ] **Step 3: Commit**

```bash
git add desktop/electron/agent/server.ts
git commit -m "feat: extend /v1/chat to accept stepId and workflowId"
```

---

## Task 2: Backend - AgentService 支持 Step Context

**Files:**
- Modify: `desktop/electron/agent/agentService.ts:22-25` (ChatStreamOptions 类型)
- Modify: `desktop/electron/agent/agentService.ts:129-132` (streamEvents 参数)
- Modify: `desktop/electron/agent/agentService.ts:136-146` (system prompt 构建)

- [ ] **Step 1: 扩展 ChatStreamOptions 类型**

```typescript
// 修改前
export type ChatStreamOptions = {
  mode: ChatMode;
  skills?: string[];
};

// 修改后
export type ChatStreamOptions = {
  mode: ChatMode;
  skills?: string[];
  stepId?: string;
  workflowId?: string;
};
```

- [ ] **Step 2: 修改 streamEvents 方法，支持构建带 context 的 system prompt**

```typescript
// 修改 streamEvents 方法签名（第 129-132 行）
async *streamEvents(
  threadId: string,
  message: string,
  options: ChatStreamOptions,
): AsyncGenerator<...> {
  const mode = options.mode;
  const agent = this.getAgent(mode);
  
  // 修改 system prompt 构建逻辑
  let systemPrompt: string;
  if (options.stepId && options.workflowId) {
    // Step Chat 模式：构建含 context 的 prompt
    systemPrompt = await buildStepChatSystemPrompt(
      mode,
      this.config!.workspaceRoot,
      options.stepId,
      options.workflowId,
      options.skills ?? [],
    );
  } else {
    // 普通 Chat 模式
    systemPrompt = await buildChatSystemPrompt(
      mode,
      this.config!.workspaceRoot,
      options.skills ?? [],
    );
  }
  
  // 其余逻辑不变...
}
```

- [ ] **Step 3: Commit**

```bash
git add desktop/electron/agent/agentService.ts
git commit -m "feat: agentService support step context in streamEvents"
```

---

## Task 3: Backend - 添加 Step Chat System Prompt 构建

**Files:**
- Modify: `desktop/electron/agent/prompt.ts` (添加新函数)

- [ ] **Step 1: 添加 buildStepChatSystemPrompt 函数**

在 `desktop/electron/agent/prompt.ts` 末尾添加：

```typescript
export async function buildStepChatSystemPrompt(
  mode: ChatMode,
  workspaceRoot: string,
  stepId: string,
  workflowId: string,
  skills: string[],
): Promise<string> {
  // 基础 system prompt
  const basePrompt = await buildChatSystemPrompt(mode, workspaceRoot, skills);
  
  // 读取 workflow 定义获取 step 信息
  const workflowPath = path.join(workspaceRoot, ".agentflow", "workflows", `${workflowId}.json`);
  let stepInfo = "";
  try {
    const workflowContent = await fs.readFile(workflowPath, "utf-8");
    const workflow = JSON.parse(workflowContent) as { steps?: Array<{ id: string; title: string; prompt_template?: string }> };
    const step = workflow.steps?.find((s) => s.id === stepId);
    if (step) {
      stepInfo = `\n\n## Current Step Context\n- Step ID: ${stepId}\n- Step Title: ${step.title}\n- Step Purpose: ${step.prompt_template ?? "Execute step tasks"}`;
    }
  } catch {
    // workflow 文件不存在时忽略
  }
  
  return `${basePrompt}${stepInfo}\n\nWhen responding, consider the current step context and provide relevant assistance for this specific workflow step.`;
}
```

- [ ] **Step 2: 在 agentService.ts 中导入新函数**

```typescript
// 修改第 10 行
import { buildChatSystemPrompt, buildStepChatSystemPrompt, type ChatMode } from "./prompt";
```

- [ ] **Step 3: Commit**

```bash
git add desktop/electron/agent/prompt.ts desktop/electron/agent/agentService.ts
git commit -m "feat: add buildStepChatSystemPrompt for step context injection"
```

---

## Task 4: Frontend - useWorkflow 添加 stepChat 函数

**Files:**
- Modify: `desktop/src/composables/useWorkflow.ts:293-318` (fileChat 附近添加)

- [ ] **Step 1: 添加 stepChat 函数**

在 `fileChat` 函数后添加：

```typescript
async function* stepChat(
  message: string,
  stepId: string,
  workflowId: string,
  threadId: string,
  skills?: string[],
  mode: "ask" | "plan" | "agent" = "agent",
): AsyncGenerator<SseEvent> {
  const body: Record<string, unknown> = {
    message,
    thread_id: threadId,
    mode,
    stepId,
    workflowId,
  };
  if (skills?.length) body.skills = skills;

  const res = await fetch(`${await apiBase()}/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Step chat failed: ${res.status}`);
  }

  yield* parseSseStream(res.body);
}
```

- [ ] **Step 2: 在 return 对象中添加 stepChat**

```typescript
return {
  // ... 其他函数
  fileChat,
  stepChat, // 新增
  // ...
};
```

- [ ] **Step 3: Commit**

```bash
git add desktop/src/composables/useWorkflow.ts
git commit -m "feat: add stepChat function to useWorkflow composable"
```

---

## Task 5: Frontend - WorkflowRun.vue 改用 stepChat

**Files:**
- Modify: `desktop/src/pages/WorkflowRun.vue:628-663` (onStepSend 函数)

- [ ] **Step 1: 导入 stepChat 函数**

```typescript
// 在解构 useWorkflow 返回值时
const {
  // ... 其他
  fileChat,
  stepChat, // 新增
} = workflowApi;
```

- [ ] **Step 2: 修改 onStepSend 函数逻辑**

```typescript
// 修改前 (第 654-663 行)
const eventStream = useFileChat
  ? fileChat(...)
  : runStep(stepId, skills, activeWorkflowId.value, expanded);

// 修改后
let eventStream: AsyncGenerator<SseEvent>;
if (useFileChat) {
  eventStream = fileChat(
    payload.attachments.map((a) => a.path),
    expanded,
    skills,
    stepId,
    threadId,
    activeWorkflowId.value,
  );
} else {
  // 使用新的 stepChat 替代 runStep
  eventStream = stepChat(
    expanded,
    stepId,
    activeWorkflowId.value,
    threadId,
    skills,
    "agent",
  );
}
```

- [ ] **Step 3: 删除不再使用的 runStep 引用（可选，如其他地方不用）**

如果 `runStep` 在其他地方不再使用，可以从导入和解构中移除。

- [ ] **Step 4: Commit**

```bash
git add desktop/src/pages/WorkflowRun.vue
git commit -m "feat: step chat use stepChat instead of runStep"
```

---

## Task 6: 测试验证

**Files:**
- Test: 手动测试 `desktop/src/pages/WorkflowRun.vue` 中的 Step Chat 功能

- [ ] **Step 1: 启动应用测试**

```bash
cd desktop
pnpm dev:electron
```

- [ ] **Step 2: 验证 Step Chat 功能**

1. 打开 Workflow Run 页面
2. 在某个 step（如 `fe-dev`）中发送消息
3. 验证：
   - 用户消息正确显示在 UI 中
   - AI 回复基于用户输入（而非固定 prompt）
   - AI 回复考虑了 step context（如知道自己在做前端开发）

- [ ] **Step 3: Commit 测试结果记录**

```bash
git commit --allow-empty -m "test: verify step chat uses user message with context"
```

---

## Self-Review Checklist

- [ ] **Spec coverage:** 所有修改点都有对应任务
- [ ] **Type consistency:** `stepId`/`workflowId` 在所有文件中类型一致
- [ ] **No placeholders:** 所有代码都完整展示
- [ ] **Backward compatibility:** 普通 Chat（不带 stepId）仍然正常工作

---

## 执行选项

**Plan complete and saved to `docs/superpowers/plans/2026-06-20-step-chat-use-chat-api.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
