import { _ as _sfc_main$2 } from "./MarkdownPreview.vue_vue_type_script_setup_true_lang-CGx813Ou.js";
import { d as defineComponent, r as ref, w as watch, a as onMounted, o as openBlock, b as createElementBlock, e as createBaseVNode, F as Fragment, f as renderList, n as normalizeClass, t as toDisplayString, g as createCommentVNode, h as createVNode, i as computed, c as createBlock } from "./index-CRlMfF3U.js";
const _hoisted_1 = { class: "flex flex-1 min-h-0" };
const _hoisted_2 = { class: "w-44 border-r border-gray-200 bg-gray-50 shrink-0" };
const _hoisted_3 = ["onClick"];
const _hoisted_4 = { class: "flex-1 flex flex-col min-w-0" };
const _hoisted_5 = { class: "px-4 py-2 border-b border-gray-200 bg-white text-sm font-medium text-gray-700" };
const _hoisted_6 = {
  key: 0,
  class: "px-4 py-1 text-xs text-amber-700 bg-amber-50"
};
const _hoisted_7 = {
  key: 1,
  class: "flex-1 flex items-center justify-center text-sm text-gray-400"
};
const _hoisted_8 = {
  key: 2,
  class: "flex-1 overflow-y-auto p-6"
};
const _hoisted_9 = {
  key: 3,
  class: "flex-1 flex items-center justify-center text-sm text-gray-400"
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "WorkflowArchitecturePanel",
  props: {
    api: {},
    files: {}
  },
  setup(__props) {
    const DEFAULT_ARCH_FILES = [
      { path: "docs/architecture.md", label: "Architecture" },
      { path: "AGENTS.md", label: "AGENTS.md" }
    ];
    const props = __props;
    const archFiles = computed(
      () => props.files?.length ? props.files : DEFAULT_ARCH_FILES
    );
    const selectedPath = ref(archFiles.value[0].path);
    const content = ref("");
    const loading = ref(false);
    const error = ref(null);
    async function loadFile(path) {
      loading.value = true;
      error.value = null;
      try {
        const file = await props.api.readWorkspaceFile(path);
        content.value = file.content;
      } catch {
        content.value = "";
        error.value = `File not found: ${path}`;
      } finally {
        loading.value = false;
      }
    }
    watch(
      archFiles,
      (files) => {
        if (!files.some((f) => f.path === selectedPath.value)) {
          selectedPath.value = files[0]?.path ?? "";
        }
      },
      { immediate: true }
    );
    onMounted(() => {
      if (selectedPath.value) void loadFile(selectedPath.value);
    });
    watch(selectedPath, (path) => {
      if (path) void loadFile(path);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("aside", _hoisted_2, [
          _cache[0] || (_cache[0] = createBaseVNode("div", { class: "p-2 border-b border-gray-200" }, [
            createBaseVNode("span", { class: "text-xs font-medium text-gray-500" }, "Architecture")
          ], -1)),
          (openBlock(true), createElementBlock(Fragment, null, renderList(archFiles.value, (file) => {
            return openBlock(), createElementBlock("button", {
              key: file.path,
              class: normalizeClass(["w-full text-left px-3 py-2 text-xs border-b border-gray-100 hover:bg-gray-100", selectedPath.value === file.path ? "bg-blue-50 text-blue-700" : "text-gray-700"]),
              onClick: ($event) => selectedPath.value = file.path
            }, toDisplayString(file.label), 11, _hoisted_3);
          }), 128))
        ]),
        createBaseVNode("section", _hoisted_4, [
          createBaseVNode("div", _hoisted_5, toDisplayString(selectedPath.value), 1),
          error.value ? (openBlock(), createElementBlock("p", _hoisted_6, toDisplayString(error.value), 1)) : createCommentVNode("", true),
          loading.value ? (openBlock(), createElementBlock("div", _hoisted_7, " Loading… ")) : content.value ? (openBlock(), createElementBlock("div", _hoisted_8, [
            createVNode(_sfc_main$2, { content: content.value }, null, 8, ["content"])
          ])) : (openBlock(), createElementBlock("div", _hoisted_9, " Architecture document not created yet. Use chat to generate docs/architecture.md. "))
        ])
      ]);
    };
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ArchitectureDocsWidget",
  props: {
    api: {},
    files: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$1, {
        api: __props.api,
        files: __props.files
      }, null, 8, ["api", "files"]);
    };
  }
});
export {
  _sfc_main as default
};
