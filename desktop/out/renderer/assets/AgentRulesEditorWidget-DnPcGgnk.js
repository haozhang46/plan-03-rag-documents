import { _ as _sfc_main$1 } from "./MarkdownFilePanel.vue_vue_type_script_setup_true_lang-DsSaG5bf.js";
import { d as defineComponent, o as openBlock, c as createBlock } from "./index-CRlMfF3U.js";
import "./MarkdownPreview.vue_vue_type_script_setup_true_lang-CGx813Ou.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AgentRulesEditorWidget",
  props: {
    api: {},
    componentId: {},
    files: {},
    editable: { type: Boolean }
  },
  setup(__props) {
    const DEFAULT_FILES = [
      { path: "AGENTS.md", label: "AGENTS.md" },
      { path: "CLAUDE.md", label: "CLAUDE.md" }
    ];
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$1, {
        api: __props.api,
        "component-id": __props.componentId,
        mode: "file-list",
        files: __props.files,
        "default-files": DEFAULT_FILES,
        editable: __props.editable,
        "sidebar-title": "Agent Rules"
      }, null, 8, ["api", "component-id", "files", "editable"]);
    };
  }
});
export {
  _sfc_main as default
};
