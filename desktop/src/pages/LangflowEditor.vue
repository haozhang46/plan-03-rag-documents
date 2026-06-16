<script setup lang="ts">
import { ref } from "vue";

const SAMPLE_FIXTURE = {
  id: "demo-workflow",
  title: "Demo Workflow",
  nodes: [
    {
      id: "node-1",
      data: {
        metadata: {
          id: "step-a",
          title: "Step A",
          executor: "deepseek",
          skills: ["brainstorming"],
        },
      },
    },
    {
      id: "node-2",
      data: {
        metadata: {
          id: "step-b",
          title: "Step B",
          executor: "claude-code",
          skills: [],
        },
      },
    },
  ],
  edges: [{ source: "node-1", target: "node-2" }],
};

const jsonText = ref("");
const compiling = ref(false);
const message = ref<{ type: "success" | "error"; text: string } | null>(null);

function loadSampleFixture() {
  jsonText.value = JSON.stringify(SAMPLE_FIXTURE, null, 2);
  message.value = null;
}

async function compileAndSave() {
  message.value = null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText.value);
  } catch {
    message.value = { type: "error", text: "Invalid JSON — check syntax and try again." };
    return;
  }

  if (!parsed || typeof parsed !== "object") {
    message.value = { type: "error", text: "Langflow export must be a JSON object." };
    return;
  }

  compiling.value = true;
  try {
    const port = await window.desktop.getSidecarPort();
    const res = await fetch(`http://127.0.0.1:${port}/v1/workflow/compile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ langflowJson: parsed }),
    });

    if (!res.ok) {
      let detail = res.statusText;
      try {
        const body = (await res.json()) as { detail?: string };
        if (body.detail) detail = body.detail;
      } catch {
        /* ignore */
      }
      message.value = { type: "error", text: `Compile failed (${res.status}): ${detail}` };
      return;
    }

    const workflow = (await res.json()) as { id: string; title: string; steps: unknown[] };
    message.value = {
      type: "success",
      text: `Saved workflow "${workflow.title}" (${workflow.id}) with ${workflow.steps.length} step(s) to .agentflow/workflow.yaml`,
    };
  } catch (err) {
    const text = err instanceof Error ? err.message : String(err);
    message.value = { type: "error", text: `Request failed: ${text}` };
  } finally {
    compiling.value = false;
  }
}
</script>

<template>
  <div class="flex-1 overflow-auto p-8 bg-gray-50">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-xl font-semibold mb-2">Langflow Editor</h1>
      <p class="text-sm text-gray-600 mb-6">
        Full Langflow visual editor bundle is planned for v1.1. For now, paste a Langflow JSON
        export below and compile it into <code class="text-xs bg-gray-200 px-1 rounded">.agentflow/workflow.yaml</code>.
      </p>

      <div class="flex gap-2 mb-3">
        <button type="button" class="btn-primary bg-gray-600 hover:bg-gray-700" @click="loadSampleFixture">
          Load sample fixture
        </button>
        <button
          type="button"
          class="btn-primary"
          :disabled="compiling || !jsonText.trim()"
          @click="compileAndSave"
        >
          {{ compiling ? "Compiling…" : "Compile & Save" }}
        </button>
      </div>

      <textarea
        v-model="jsonText"
        class="input-field font-mono text-sm min-h-64 resize-y"
        placeholder='Paste Langflow export JSON here, e.g. { "nodes": [...], "edges": [...] }'
        spellcheck="false"
      />

      <p
        v-if="message"
        class="mt-4 text-sm rounded-lg px-4 py-3"
        :class="
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        "
      >
        {{ message.text }}
      </p>
    </div>
  </div>
</template>
