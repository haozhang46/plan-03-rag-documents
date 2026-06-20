import { _ as _sfc_main$1 } from "./MarkdownFilePanel.vue_vue_type_script_setup_true_lang-DsSaG5bf.js";
import { d as defineComponent, o as openBlock, c as createBlock } from "./index-CRlMfF3U.js";
import "./MarkdownPreview.vue_vue_type_script_setup_true_lang-CGx813Ou.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MarkdownDocWidget",
  props: {
    api: {},
    docsDir: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$1, {
        api: __props.api,
        mode: "directory",
        "docs-dir": __props.docsDir,
        "sidebar-title": "Documents",
        "allow-delete": true
      }, null, 8, ["api", "docs-dir"]);
    };
  }
});
export {
  _sfc_main as default
};
