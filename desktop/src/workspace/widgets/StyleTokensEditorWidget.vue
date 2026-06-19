<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import type { PanelApi } from "../registryComponents";

type ThemeTokens = {
  primary: string;
  secondary: string;
  accent: string;
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
};

const props = defineProps<{
  api: PanelApi;
  preset: "unocss" | "tailwind";
  target: string;
  themeFile?: string;
}>();

const DEFAULT_TOKENS: ThemeTokens = {
  primary: "#2563eb",
  secondary: "#64748b",
  accent: "#7c3aed",
  spacingSm: "0.5rem",
  spacingMd: "1rem",
  spacingLg: "2rem",
};

const tokens = ref<ThemeTokens>({ ...DEFAULT_TOKENS });
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const saveMessage = ref<string | null>(null);

function jsonPath(): string {
  return props.themeFile ?? ".agentflow/theme-tokens.json";
}

function parseTokensFromUno(content: string): Partial<ThemeTokens> {
  const out: Partial<ThemeTokens> = {};
  const primary = /primary:\s*["']([^"']+)["']/.exec(content);
  const secondary = /secondary:\s*["']([^"']+)["']/.exec(content);
  const accent = /accent:\s*["']([^"']+)["']/.exec(content);
  if (primary) out.primary = primary[1];
  if (secondary) out.secondary = secondary[1];
  if (accent) out.accent = accent[1];
  const sm = /\bsm:\s*["']([^"']+)["']/.exec(content);
  const md = /\bmd:\s*["']([^"']+)["']/.exec(content);
  const lg = /\blg:\s*["']([^"']+)["']/.exec(content);
  if (sm) out.spacingSm = sm[1];
  if (md) out.spacingMd = md[1];
  if (lg) out.spacingLg = lg[1];
  return out;
}

function patchUnoConfig(content: string, t: ThemeTokens): string {
  const themeBlock = `  theme: {
    colors: {
      brand: {
        primary: "${t.primary}",
        secondary: "${t.secondary}",
        accent: "${t.accent}",
      },
    },
    spacing: {
      sm: "${t.spacingSm}",
      md: "${t.spacingMd}",
      lg: "${t.spacingLg}",
    },
  },`;

  if (/theme:\s*\{/.test(content)) {
    return content.replace(/theme:\s*\{[\s\S]*?\n  \},/, themeBlock);
  }
  return content.replace(
    /defineConfig\(\{/,
    `defineConfig({\n${themeBlock}`,
  );
}

async function loadTokens() {
  loading.value = true;
  error.value = null;
  saveMessage.value = null;
  tokens.value = { ...DEFAULT_TOKENS };
  try {
    try {
      const file = await props.api.readWorkspaceFile(jsonPath());
      const parsed = JSON.parse(file.content) as Partial<ThemeTokens>;
      tokens.value = { ...DEFAULT_TOKENS, ...parsed };
    } catch {
      if (props.preset === "unocss") {
        try {
          const file = await props.api.readWorkspaceFile(props.target);
          tokens.value = { ...DEFAULT_TOKENS, ...parseTokensFromUno(file.content) };
        } catch {
          /* use defaults */
        }
      }
    }
  } finally {
    loading.value = false;
  }
}

async function saveTokens() {
  saving.value = true;
  error.value = null;
  saveMessage.value = null;
  try {
    await props.api.writeWorkspaceFile(jsonPath(), JSON.stringify(tokens.value, null, 2));

    if (props.preset === "unocss") {
      try {
        const file = await props.api.readWorkspaceFile(props.target);
        const patched = patchUnoConfig(file.content, tokens.value);
        await props.api.writeWorkspaceFile(props.target, patched);
        saveMessage.value = `Saved ${jsonPath()} and patched ${props.target}`;
      } catch {
        saveMessage.value = `Saved ${jsonPath()} (config patch skipped)`;
      }
    } else {
      saveMessage.value = `Saved ${jsonPath()}`;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  void loadTokens();
});

watch(
  () => [props.target, props.themeFile, props.preset] as const,
  () => {
    void loadTokens();
  },
);
</script>

<template>
  <div class="flex flex-1 min-h-0 flex-col p-4 gap-4 overflow-y-auto">
    <header class="flex items-center gap-2">
      <h2 class="text-sm font-semibold text-gray-800">Style Tokens</h2>
      <span class="text-xs text-gray-400">{{ preset }} → {{ themeFile ?? target }}</span>
      <button
        class="ml-auto text-xs px-3 py-1.5 rounded bg-blue-600 text-white disabled:opacity-50"
        :disabled="saving || loading"
        data-testid="save-tokens"
        @click="saveTokens"
      >
        {{ saving ? "Saving…" : "Save" }}
      </button>
    </header>

    <p v-if="error" class="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">{{ error }}</p>
    <p v-if="saveMessage" class="text-xs text-green-700 bg-green-50 px-3 py-2 rounded">{{ saveMessage }}</p>

    <div v-if="loading" class="text-sm text-gray-400">Loading tokens…</div>

    <form v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl" @submit.prevent="saveTokens">
      <fieldset class="space-y-3">
        <legend class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Colors</legend>
        <label v-for="key in ['primary', 'secondary', 'accent'] as const" :key="key" class="flex items-center gap-3">
          <span class="text-sm text-gray-700 w-20 capitalize">{{ key }}</span>
          <input
            v-model="tokens[key]"
            type="color"
            class="w-10 h-8 rounded border border-gray-300 cursor-pointer"
          />
          <input
            v-model="tokens[key]"
            type="text"
            class="flex-1 text-sm px-2 py-1 border border-gray-300 rounded font-mono"
          />
        </label>
      </fieldset>

      <fieldset class="space-y-3">
        <legend class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Spacing</legend>
        <label v-for="key in ['spacingSm', 'spacingMd', 'spacingLg'] as const" :key="key" class="flex items-center gap-3">
          <span class="text-sm text-gray-700 w-20">{{ key.replace('spacing', '') }}</span>
          <input
            v-model="tokens[key]"
            type="text"
            class="flex-1 text-sm px-2 py-1 border border-gray-300 rounded font-mono"
          />
        </label>
      </fieldset>
    </form>

    <div class="flex gap-3 mt-2">
      <div
        class="w-16 h-16 rounded-lg border border-gray-200"
        :style="{ backgroundColor: tokens.primary }"
        title="Primary preview"
      />
      <div
        class="w-16 h-16 rounded-lg border border-gray-200"
        :style="{ backgroundColor: tokens.secondary }"
        title="Secondary preview"
      />
      <div
        class="w-16 h-16 rounded-lg border border-gray-200"
        :style="{ backgroundColor: tokens.accent }"
        title="Accent preview"
      />
    </div>
  </div>
</template>
