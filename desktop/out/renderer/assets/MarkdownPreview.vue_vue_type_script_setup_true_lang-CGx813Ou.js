import { d as defineComponent, o as openBlock, b as createElementBlock, i as computed, q as g } from "./index-CRlMfF3U.js";
const _hoisted_1 = ["innerHTML"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MarkdownPreview",
  props: {
    content: {}
  },
  setup(__props) {
    const props = __props;
    const html = computed(() => g.parse(props.content));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "prose prose-sm max-w-none text-gray-800",
        innerHTML: html.value
      }, null, 8, _hoisted_1);
    };
  }
});
export {
  _sfc_main as _
};
