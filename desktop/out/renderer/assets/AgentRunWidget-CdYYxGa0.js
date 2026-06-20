import { _ as _sfc_main$2 } from "./MarkdownPreview.vue_vue_type_script_setup_true_lang-CGx813Ou.js";
import { d as defineComponent, a as onMounted, w as watch, o as openBlock, b as createElementBlock, e as createBaseVNode, t as toDisplayString, n as normalizeClass, g as createCommentVNode, F as Fragment, f as renderList, h as createVNode, r as ref, i as computed, c as createBlock } from "./index-CRlMfF3U.js";
const _hoisted_1 = { class: "flex flex-1 min-h-0 flex-col overflow-y-auto" };
const _hoisted_2 = { class: "px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-3" };
const _hoisted_3 = { class: "text-sm font-semibold text-gray-800" };
const _hoisted_4 = {
  key: 0,
  class: "text-xs text-blue-600 animate-pulse"
};
const _hoisted_5 = ["disabled"];
const _hoisted_6 = {
  key: 0,
  class: "px-4 py-2 border-b border-gray-100 flex flex-wrap gap-2"
};
const _hoisted_7 = {
  key: 1,
  class: "border-b border-gray-200"
};
const _hoisted_8 = { class: "m-0 p-4 text-xs font-mono whitespace-pre-wrap text-gray-800 max-h-64 overflow-y-auto bg-gray-50" };
const _hoisted_9 = {
  key: 2,
  class: "border-b border-gray-200"
};
const _hoisted_10 = { class: "p-4" };
const _hoisted_11 = {
  key: 3,
  class: "border-b border-gray-200"
};
const _hoisted_12 = { class: "px-4 py-2 bg-gray-50 text-xs font-medium text-gray-600" };
const _hoisted_13 = { class: "p-4" };
const _hoisted_14 = {
  key: 4,
  class: "flex-1 flex items-center justify-center text-sm text-gray-400 p-8 text-center"
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "WorkflowAgentRunPanel",
  props: {
    api: {},
    stepId: {},
    stepTitle: {},
    status: {},
    reportPath: {},
    running: { type: Boolean },
    liveOutput: {}
  },
  setup(__props) {
    const props = __props;
    const phaseContent = ref(null);
    const gateResults = ref([]);
    const reportContent = ref(null);
    const loading = ref(false);
    const statusLabel = {
      pending: "Pending",
      running: "Running",
      done: "Done",
      failed: "Failed",
      skipped: "Skipped"
    };
    const statusClass = {
      pending: "bg-gray-100 text-gray-600",
      running: "bg-blue-100 text-blue-700",
      done: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
      skipped: "bg-yellow-100 text-yellow-800"
    };
    const gateClass = (status) => {
      if (status === "PASS") return "text-green-700 bg-green-50";
      if (status === "FAIL") return "text-red-700 bg-red-50";
      return "text-gray-600 bg-gray-50";
    };
    const showLive = computed(() => props.running || props.liveOutput.length > 0);
    async function refresh() {
      loading.value = true;
      try {
        const [phase, gates] = await Promise.all([
          props.api.fetchPhase(props.stepId),
          props.api.fetchGates(props.stepId)
        ]);
        phaseContent.value = phase.content;
        gateResults.value = gates.results;
        if (props.reportPath) {
          try {
            const report = await props.api.readWorkspaceFile(props.reportPath);
            reportContent.value = report.content;
          } catch {
            reportContent.value = null;
          }
        } else {
          reportContent.value = null;
        }
      } finally {
        loading.value = false;
      }
    }
    onMounted(() => {
      void refresh();
    });
    watch(
      () => [props.stepId, props.status, props.running],
      () => {
        if (!props.running) void refresh();
      }
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("h2", _hoisted_3, toDisplayString(__props.stepTitle), 1),
          createBaseVNode("span", {
            class: normalizeClass(["text-[10px] px-2 py-0.5 rounded-full font-medium", statusClass[__props.status]])
          }, toDisplayString(statusLabel[__props.status]), 3),
          __props.running ? (openBlock(), createElementBlock("span", _hoisted_4, "Agent running…")) : createCommentVNode("", true),
          createBaseVNode("button", {
            class: "ml-auto text-xs text-gray-500 hover:text-gray-700",
            disabled: loading.value,
            onClick: refresh
          }, " Refresh ", 8, _hoisted_5)
        ]),
        gateResults.value.length ? (openBlock(), createElementBlock("div", _hoisted_6, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(gateResults.value, (gate) => {
            return openBlock(), createElementBlock("span", {
              key: gate.id,
              class: normalizeClass(["text-[10px] px-2 py-0.5 rounded-full", gateClass(gate.status)])
            }, toDisplayString(gate.id) + ": " + toDisplayString(gate.status), 3);
          }), 128))
        ])) : createCommentVNode("", true),
        showLive.value ? (openBlock(), createElementBlock("section", _hoisted_7, [
          _cache[0] || (_cache[0] = createBaseVNode("div", { class: "px-4 py-2 bg-blue-50 text-xs font-medium text-blue-800" }, "Live output", -1)),
          createBaseVNode("pre", _hoisted_8, toDisplayString(__props.liveOutput || "Waiting for agent output…"), 1)
        ])) : createCommentVNode("", true),
        phaseContent.value ? (openBlock(), createElementBlock("section", _hoisted_9, [
          _cache[1] || (_cache[1] = createBaseVNode("div", { class: "px-4 py-2 bg-gray-50 text-xs font-medium text-gray-600" }, "Phase summary", -1)),
          createBaseVNode("div", _hoisted_10, [
            createVNode(_sfc_main$2, { content: phaseContent.value }, null, 8, ["content"])
          ])
        ])) : createCommentVNode("", true),
        reportContent.value ? (openBlock(), createElementBlock("section", _hoisted_11, [
          createBaseVNode("div", _hoisted_12, " Report — " + toDisplayString(__props.reportPath), 1),
          createBaseVNode("div", _hoisted_13, [
            createVNode(_sfc_main$2, { content: reportContent.value }, null, 8, ["content"])
          ])
        ])) : createCommentVNode("", true),
        !showLive.value && !phaseContent.value && !reportContent.value && !loading.value ? (openBlock(), createElementBlock("div", _hoisted_14, " Run this step via chat to see agent progress and results here. ")) : createCommentVNode("", true)
      ]);
    };
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AgentRunWidget",
  props: {
    api: {},
    stepId: {},
    stepTitle: {},
    status: {},
    reportPath: {},
    running: { type: Boolean },
    liveOutput: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$1, {
        api: __props.api,
        "step-id": __props.stepId,
        "step-title": __props.stepTitle,
        status: __props.status,
        "report-path": __props.reportPath,
        running: __props.running,
        "live-output": __props.liveOutput
      }, null, 8, ["api", "step-id", "step-title", "status", "report-path", "running", "live-output"]);
    };
  }
});
export {
  _sfc_main as default
};
