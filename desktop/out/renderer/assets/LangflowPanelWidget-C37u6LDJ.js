import { d as defineComponent, a as onMounted, o as openBlock, b as createElementBlock, e as createBaseVNode, F as Fragment, t as toDisplayString, g as createCommentVNode, c as createBlock, _ as _sfc_main$1, r as ref, x as useLangflow } from "./index-CRlMfF3U.js";
const _hoisted_1 = { class: "flex flex-1 min-h-0 flex-col" };
const _hoisted_2 = {
  key: 0,
  class: "flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center",
  "data-testid": "langflow-missing-flow"
};
const _hoisted_3 = { class: "flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white shrink-0" };
const _hoisted_4 = { class: "text-xs text-gray-400 font-mono" };
const _hoisted_5 = { class: "text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600" };
const _hoisted_6 = {
  key: 0,
  class: "flex-1 flex items-center justify-center text-sm text-gray-400"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "LangflowPanelWidget",
  props: {
    api: {},
    flowId: {},
    mode: {}
  },
  setup(__props) {
    const { fetchStatus } = useLangflow();
    const loading = ref(true);
    const offline = ref(false);
    const baseUrl = ref("");
    async function loadStatus() {
      loading.value = true;
      try {
        const status = await fetchStatus();
        offline.value = !status.ok;
        baseUrl.value = status.baseUrl;
      } catch {
        offline.value = true;
        baseUrl.value = "";
      } finally {
        loading.value = false;
      }
    }
    onMounted(() => {
      void loadStatus();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        !__props.flowId ? (openBlock(), createElementBlock("div", _hoisted_2, [..._cache[0] || (_cache[0] = [
          createBaseVNode("p", { class: "text-sm text-gray-600" }, "No Langflow flow configured.", -1),
          createBaseVNode("p", { class: "text-xs text-gray-500" }, " Set a flow in workspace properties (langflow-flow picker). ", -1)
        ])])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
          createBaseVNode("header", _hoisted_3, [
            _cache[1] || (_cache[1] = createBaseVNode("span", { class: "text-sm font-medium text-gray-700" }, "Langflow", -1)),
            createBaseVNode("span", _hoisted_4, toDisplayString(__props.flowId), 1),
            createBaseVNode("span", _hoisted_5, toDisplayString(__props.mode), 1),
            offline.value ? (openBlock(), createElementBlock("button", {
              key: 0,
              type: "button",
              class: "ml-auto text-xs text-blue-600 hover:underline",
              onClick: loadStatus
            }, " Retry connection ")) : createCommentVNode("", true)
          ]),
          loading.value ? (openBlock(), createElementBlock("div", _hoisted_6, " Connecting to Langflow… ")) : (openBlock(), createBlock(_sfc_main$1, {
            key: 1,
            "base-url": baseUrl.value,
            "flow-id": __props.flowId,
            offline: offline.value,
            "data-testid": "langflow-webview"
          }, null, 8, ["base-url", "flow-id", "offline"]))
        ], 64))
      ]);
    };
  }
});
export {
  _sfc_main as default
};
