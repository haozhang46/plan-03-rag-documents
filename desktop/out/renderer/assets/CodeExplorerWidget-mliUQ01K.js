import { d as defineComponent, a as onMounted, w as watch, o as openBlock, b as createElementBlock, e as createBaseVNode, t as toDisplayString, F as Fragment, f as renderList, n as normalizeClass, g as createCommentVNode, r as ref, c as createBlock } from "./index-CRlMfF3U.js";
const _hoisted_1 = { class: "flex flex-1 min-h-0" };
const _hoisted_2 = { class: "w-56 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0" };
const _hoisted_3 = { class: "p-2 border-b border-gray-200" };
const _hoisted_4 = { class: "text-xs font-medium text-gray-500" };
const _hoisted_5 = { class: "flex-1 overflow-y-auto" };
const _hoisted_6 = ["onClick"];
const _hoisted_7 = {
  key: 0,
  class: "p-3 text-xs text-gray-400"
};
const _hoisted_8 = { class: "flex-1 flex flex-col min-w-0" };
const _hoisted_9 = { class: "px-4 py-2 border-b border-gray-200 bg-white text-xs font-mono text-gray-600 truncate" };
const _hoisted_10 = {
  key: 0,
  class: "px-4 py-1 text-xs text-red-600 bg-red-50"
};
const _hoisted_11 = {
  key: 1,
  class: "flex-1 flex items-center justify-center text-sm text-gray-400"
};
const _hoisted_12 = {
  key: 2,
  class: "flex-1 overflow-auto p-4 text-xs font-mono leading-relaxed bg-gray-900 text-gray-100 m-0"
};
const _hoisted_13 = {
  key: 3,
  class: "flex-1 flex items-center justify-center text-sm text-gray-400"
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "WorkflowCodeExplorer",
  props: {
    api: {},
    root: {}
  },
  setup(__props) {
    const props = __props;
    const files = ref([]);
    const selectedPath = ref(null);
    const content = ref("");
    const loading = ref(false);
    const fileLoading = ref(false);
    const error = ref(null);
    const CODE_EXT = /\.(ts|tsx|js|jsx|vue|py|go|rs|java|json|yaml|yml|md|css|html|toml)$/i;
    async function loadFiles() {
      loading.value = true;
      error.value = null;
      try {
        const { entries } = await props.api.listWorkspace(props.root, true);
        files.value = entries.filter((e) => CODE_EXT.test(e.name));
        if (!selectedPath.value && files.value.length) {
          await selectFile(files.value[0].path);
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      } finally {
        loading.value = false;
      }
    }
    async function selectFile(path) {
      fileLoading.value = true;
      error.value = null;
      try {
        const file = await props.api.readWorkspaceFile(path);
        selectedPath.value = path;
        content.value = file.content;
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      } finally {
        fileLoading.value = false;
      }
    }
    onMounted(() => {
      void loadFiles();
    });
    watch(
      () => props.root,
      () => {
        selectedPath.value = null;
        content.value = "";
        void loadFiles();
      }
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("aside", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            createBaseVNode("span", _hoisted_4, toDisplayString(__props.root) + "/", 1)
          ]),
          createBaseVNode("div", _hoisted_5, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(files.value, (file) => {
              return openBlock(), createElementBlock("button", {
                key: file.path,
                class: normalizeClass(["w-full text-left px-3 py-1.5 text-xs font-mono border-b border-gray-100 hover:bg-gray-100 truncate", selectedPath.value === file.path ? "bg-blue-50 text-blue-700" : "text-gray-700"]),
                onClick: ($event) => selectFile(file.path)
              }, toDisplayString(file.path.replace(`${__props.root}/`, "")), 11, _hoisted_6);
            }), 128)),
            !files.value.length && !loading.value ? (openBlock(), createElementBlock("p", _hoisted_7, " No source files yet. ")) : createCommentVNode("", true)
          ])
        ]),
        createBaseVNode("section", _hoisted_8, [
          createBaseVNode("div", _hoisted_9, toDisplayString(selectedPath.value ?? `${__props.root}/`), 1),
          error.value ? (openBlock(), createElementBlock("p", _hoisted_10, toDisplayString(error.value), 1)) : createCommentVNode("", true),
          loading.value || fileLoading.value ? (openBlock(), createElementBlock("div", _hoisted_11, " Loading… ")) : selectedPath.value ? (openBlock(), createElementBlock("pre", _hoisted_12, [
            createBaseVNode("code", null, toDisplayString(content.value), 1)
          ])) : (openBlock(), createElementBlock("div", _hoisted_13, " Select a file to view source code. "))
        ])
      ]);
    };
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CodeExplorerWidget",
  props: {
    api: {},
    root: {},
    writable: { type: Boolean }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$1, {
        api: __props.api,
        root: __props.root
      }, null, 8, ["api", "root"]);
    };
  }
});
export {
  _sfc_main as default
};
