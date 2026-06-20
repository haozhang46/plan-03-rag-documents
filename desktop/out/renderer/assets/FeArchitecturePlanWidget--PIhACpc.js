import { d as defineComponent, a as onMounted, w as watch, o as openBlock, b as createElementBlock, e as createBaseVNode, F as Fragment, f as renderList, t as toDisplayString, g as createCommentVNode, j as withDirectives, v as vModelText, h as createVNode, r as ref, i as computed } from "./index-CRlMfF3U.js";
import { _ as _sfc_main$1 } from "./MarkdownPreview.vue_vue_type_script_setup_true_lang-CGx813Ou.js";
const _hoisted_1 = { class: "flex flex-1 min-h-0" };
const _hoisted_2 = { class: "w-52 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0" };
const _hoisted_3 = { class: "flex-1 overflow-y-auto p-2 space-y-1" };
const _hoisted_4 = { class: "flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer text-sm text-gray-700" };
const _hoisted_5 = ["checked", "onChange"];
const _hoisted_6 = { class: "p-3 text-xs text-gray-400 border-t border-gray-200" };
const _hoisted_7 = { class: "flex-1 flex flex-col min-w-0" };
const _hoisted_8 = { class: "flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white" };
const _hoisted_9 = { class: "ml-auto flex gap-2" };
const _hoisted_10 = ["disabled"];
const _hoisted_11 = ["disabled"];
const _hoisted_12 = {
  key: 0,
  class: "px-4 py-1 text-xs text-red-600 bg-red-50"
};
const _hoisted_13 = {
  key: 1,
  class: "flex-1 flex items-center justify-center text-sm text-gray-400"
};
const _hoisted_14 = {
  key: 3,
  class: "flex-1 overflow-y-auto p-6"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "FeArchitecturePlanWidget",
  props: {
    api: {},
    output: {},
    layers: {}
  },
  setup(__props) {
    const props = __props;
    const content = ref("");
    const draft = ref("");
    const checkedLayers = ref([]);
    const loading = ref(false);
    const saving = ref(false);
    const error = ref(null);
    const isEditing = ref(false);
    const isDirty = computed(() => isEditing.value && draft.value !== content.value);
    function syncCheckedFromContent() {
      const present = props.layers.filter((layer) => {
        const re = new RegExp(`^[-*]\\s*${layer}\\b`, "im");
        return re.test(content.value) || content.value.toLowerCase().includes(layer.toLowerCase());
      });
      checkedLayers.value = present.length ? present : [...props.layers];
    }
    async function loadOutput() {
      loading.value = true;
      error.value = null;
      try {
        const file = await props.api.readWorkspaceFile(props.output);
        content.value = file.content;
        draft.value = file.content;
        syncCheckedFromContent();
        isEditing.value = false;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("ENOENT") || message.includes("not found")) {
          const initial = buildInitialMarkdown();
          content.value = initial;
          draft.value = initial;
          checkedLayers.value = [...props.layers];
          isEditing.value = true;
        } else {
          error.value = message;
        }
      } finally {
        loading.value = false;
      }
    }
    function buildInitialMarkdown() {
      const lines = ["# Frontend Architecture Plan", "", "## Layers", ""];
      for (const layer of props.layers) {
        lines.push(`- [ ] **${layer}** — describe responsibilities`);
      }
      lines.push("", "## Notes", "", "_Add architecture decisions here._", "");
      return lines.join("\n");
    }
    function toggleLayer(layer) {
      if (checkedLayers.value.includes(layer)) {
        checkedLayers.value = checkedLayers.value.filter((l) => l !== layer);
      } else {
        checkedLayers.value = [...checkedLayers.value, layer];
      }
      if (isEditing.value) {
        draft.value = applyLayersToMarkdown(draft.value);
      }
    }
    function applyLayersToMarkdown(md) {
      const lines = md.split("\n");
      const layerSectionIdx = lines.findIndex((l) => /^##\s+layers/i.test(l.trim()));
      const nextSectionIdx = layerSectionIdx >= 0 ? lines.findIndex((l, i) => i > layerSectionIdx && /^##\s+/.test(l.trim())) : -1;
      const layerLines = props.layers.map((layer) => {
        const checked = checkedLayers.value.includes(layer);
        return `- [${checked ? "x" : " "}] **${layer}**`;
      });
      if (layerSectionIdx >= 0) {
        nextSectionIdx >= 0 ? nextSectionIdx : lines.length;
        const before = lines.slice(0, layerSectionIdx + 1);
        const after = nextSectionIdx >= 0 ? lines.slice(nextSectionIdx) : [];
        return [...before, "", ...layerLines, "", ...after].join("\n");
      }
      return [`## Layers`, "", ...layerLines, "", md].join("\n");
    }
    function startEdit() {
      draft.value = content.value;
      syncCheckedFromContent();
      isEditing.value = true;
    }
    async function saveDoc() {
      saving.value = true;
      error.value = null;
      try {
        const body = isEditing.value ? draft.value : applyLayersToMarkdown(content.value);
        await props.api.writeWorkspaceFile(props.output, body);
        content.value = body;
        draft.value = body;
        isEditing.value = false;
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      } finally {
        saving.value = false;
      }
    }
    onMounted(() => {
      void loadOutput();
    });
    watch(
      () => props.output,
      () => {
        void loadOutput();
      }
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("aside", _hoisted_2, [
          _cache[2] || (_cache[2] = createBaseVNode("div", { class: "p-3 border-b border-gray-200" }, [
            createBaseVNode("span", { class: "text-xs font-medium text-gray-500 uppercase tracking-wide" }, "Layers")
          ], -1)),
          createBaseVNode("ul", _hoisted_3, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(__props.layers, (layer) => {
              return openBlock(), createElementBlock("li", { key: layer }, [
                createBaseVNode("label", _hoisted_4, [
                  createBaseVNode("input", {
                    type: "checkbox",
                    class: "rounded border-gray-300",
                    checked: checkedLayers.value.includes(layer),
                    onChange: ($event) => toggleLayer(layer)
                  }, null, 40, _hoisted_5),
                  createBaseVNode("span", null, toDisplayString(layer), 1)
                ])
              ]);
            }), 128))
          ]),
          createBaseVNode("p", _hoisted_6, " Output: " + toDisplayString(__props.output), 1)
        ]),
        createBaseVNode("section", _hoisted_7, [
          createBaseVNode("div", _hoisted_8, [
            _cache[3] || (_cache[3] = createBaseVNode("span", { class: "text-sm font-medium text-gray-700" }, "Architecture Plan", -1)),
            createBaseVNode("div", _hoisted_9, [
              !isEditing.value ? (openBlock(), createElementBlock("button", {
                key: 0,
                class: "text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50",
                disabled: loading.value,
                onClick: startEdit
              }, " Edit ", 8, _hoisted_10)) : createCommentVNode("", true),
              isEditing.value || checkedLayers.value.length ? (openBlock(), createElementBlock("button", {
                key: 1,
                class: "text-xs px-2 py-1 rounded bg-blue-600 text-white disabled:opacity-50",
                disabled: saving.value || isEditing.value && !isDirty.value && !checkedLayers.value.length,
                onClick: saveDoc
              }, " Save ", 8, _hoisted_11)) : createCommentVNode("", true),
              isEditing.value ? (openBlock(), createElementBlock("button", {
                key: 2,
                class: "text-xs px-2 py-1 rounded border border-gray-300",
                onClick: _cache[0] || (_cache[0] = ($event) => {
                  isEditing.value = false;
                  draft.value = content.value;
                })
              }, " Cancel ")) : createCommentVNode("", true)
            ])
          ]),
          error.value ? (openBlock(), createElementBlock("p", _hoisted_12, toDisplayString(error.value), 1)) : createCommentVNode("", true),
          loading.value ? (openBlock(), createElementBlock("div", _hoisted_13, " Loading… ")) : isEditing.value ? withDirectives((openBlock(), createElementBlock("textarea", {
            key: 2,
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => draft.value = $event),
            class: "flex-1 p-4 font-mono text-sm resize-none outline-none border-0",
            spellcheck: "false",
            "data-testid": "fe-arch-editor"
          }, null, 512)), [
            [vModelText, draft.value]
          ]) : (openBlock(), createElementBlock("div", _hoisted_14, [
            createVNode(_sfc_main$1, { content: content.value }, null, 8, ["content"])
          ]))
        ])
      ]);
    };
  }
});
export {
  _sfc_main as default
};
