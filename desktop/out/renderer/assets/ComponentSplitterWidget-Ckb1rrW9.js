import { d as defineComponent, a as onMounted, w as watch, o as openBlock, b as createElementBlock, e as createBaseVNode, t as toDisplayString, F as Fragment, f as renderList, k as normalizeStyle, n as normalizeClass, g as createCommentVNode, j as withDirectives, v as vModelText, h as createVNode, r as ref, i as computed } from "./index-CRlMfF3U.js";
import { _ as _sfc_main$1 } from "./MarkdownPreview.vue_vue_type_script_setup_true_lang-CGx813Ou.js";
const _hoisted_1 = { class: "flex flex-1 min-h-0" };
const _hoisted_2 = { class: "w-56 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0" };
const _hoisted_3 = { class: "p-2 border-b border-gray-200 flex items-center justify-between gap-1" };
const _hoisted_4 = ["disabled"];
const _hoisted_5 = { class: "flex-1 overflow-y-auto p-2" };
const _hoisted_6 = ["onClick"];
const _hoisted_7 = {
  key: 0,
  class: "p-2 text-xs text-gray-400"
};
const _hoisted_8 = {
  key: 0,
  class: "p-2 text-xs text-gray-400 border-t border-gray-200 truncate"
};
const _hoisted_9 = { class: "flex-1 flex flex-col min-w-0" };
const _hoisted_10 = { class: "flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white" };
const _hoisted_11 = { class: "text-sm font-medium text-gray-700 truncate" };
const _hoisted_12 = {
  key: 0,
  class: "ml-auto flex gap-2"
};
const _hoisted_13 = ["disabled"];
const _hoisted_14 = {
  key: 0,
  class: "px-4 py-1 text-xs text-red-600 bg-red-50"
};
const _hoisted_15 = {
  key: 1,
  class: "flex-1 flex items-center justify-center text-sm text-gray-400"
};
const _hoisted_16 = {
  key: 3,
  class: "flex-1 overflow-y-auto p-6"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ComponentSplitterWidget",
  props: {
    api: {},
    output: {},
    skills: {},
    editable: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const content = ref("");
    const draft = ref("");
    const loading = ref(false);
    const saving = ref(false);
    const loadingSkills = ref(false);
    const error = ref(null);
    const isEditing = ref(false);
    const selectedId = ref(null);
    const editable = computed(() => props.editable !== false);
    const isDirty = computed(() => isEditing.value && draft.value !== content.value);
    function parseMarkdownTree(md) {
      const lines = md.split("\n");
      const roots = [];
      const stack = [];
      let counter = 0;
      for (const line of lines) {
        const match = /^(#{1,6})\s+(.+)$/.exec(line.trim());
        if (!match) continue;
        const level = match[1].length;
        const label = match[2].replace(/\*\*/g, "").trim();
        const node = { id: `n-${counter++}`, label, level, children: [] };
        while (stack.length && stack[stack.length - 1].level >= level) {
          stack.pop();
        }
        if (stack.length) {
          stack[stack.length - 1].children.push(node);
        } else {
          roots.push(node);
        }
        stack.push(node);
      }
      return roots;
    }
    const tree = computed(() => parseMarkdownTree(isEditing.value ? draft.value : content.value));
    function flatten(nodes) {
      const out = [];
      for (const n of nodes) {
        out.push(n);
        out.push(...flatten(n.children));
      }
      return out;
    }
    const flatNodes = computed(() => flatten(tree.value));
    async function loadOutput() {
      loading.value = true;
      error.value = null;
      try {
        const file = await props.api.readWorkspaceFile(props.output);
        content.value = file.content;
        draft.value = file.content;
        isEditing.value = false;
        if (flatNodes.value.length) selectedId.value = flatNodes.value[0].id;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("ENOENT") || message.includes("not found")) {
          content.value = "# Components\n\n_Use Load from skill or edit manually._\n";
          draft.value = content.value;
          if (editable.value) isEditing.value = true;
        } else {
          error.value = message;
        }
      } finally {
        loading.value = false;
      }
    }
    async function apiBase() {
      const port = await window.desktop.getSidecarPort();
      return `http://127.0.0.1:${port}`;
    }
    function skillPaths(name) {
      return [`skills/${name}/SKILL.md`, `skills/${name.replace(/-/g, "_")}/SKILL.md`];
    }
    function extractComponentOutline(skillMd, skillName) {
      const lines = skillMd.split("\n");
      const sections = [`## ${skillName}`, ""];
      for (const line of lines) {
        if (/^#{1,3}\s+/.test(line.trim())) {
          sections.push(line.replace(/^#{1,3}/, "##"));
        }
      }
      if (sections.length <= 2) {
        sections.push("- _Review skill content for component boundaries_");
      }
      sections.push("");
      return sections.join("\n");
    }
    async function loadFromSkills() {
      if (!props.skills?.length) {
        error.value = "No skills configured. Add skills in workspace properties.";
        return;
      }
      loadingSkills.value = true;
      error.value = null;
      try {
        const res = await fetch(`${await apiBase()}/v1/skills?detailed=1`);
        if (!res.ok) throw new Error(`Skills fetch failed (${res.status})`);
        const catalog = await res.json();
        const selected = catalog.filter((s) => props.skills.includes(s.name));
        const parts = ["# Component Split", "", "_Generated from configured skills._", ""];
        for (const skill of selected) {
          parts.push(`## ${skill.name}`, "", skill.description, "");
          let loaded = false;
          for (const relPath of skillPaths(skill.name)) {
            try {
              const file = await props.api.readWorkspaceFile(relPath);
              parts.push(extractComponentOutline(file.content, skill.name));
              loaded = true;
              break;
            } catch {
            }
          }
          if (!loaded) {
            parts.push("- _Skill file not in workspace; add skills/ to project or edit manually._", "");
          }
        }
        draft.value = parts.join("\n");
        content.value = draft.value;
        isEditing.value = editable.value;
        if (flatNodes.value.length) selectedId.value = flatNodes.value[0].id;
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      } finally {
        loadingSkills.value = false;
      }
    }
    async function saveDoc() {
      saving.value = true;
      error.value = null;
      try {
        const body = isEditing.value ? draft.value : content.value;
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
    function startEdit() {
      draft.value = content.value;
      isEditing.value = true;
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
          createBaseVNode("div", _hoisted_3, [
            _cache[2] || (_cache[2] = createBaseVNode("span", { class: "text-xs font-medium text-gray-500" }, "Components", -1)),
            createBaseVNode("button", {
              class: "text-xs text-blue-600 hover:underline disabled:opacity-50",
              disabled: loadingSkills.value || !__props.skills?.length,
              "data-testid": "load-from-skill",
              onClick: loadFromSkills
            }, toDisplayString(loadingSkills.value ? "Loading…" : "Load from skill"), 9, _hoisted_4)
          ]),
          createBaseVNode("div", _hoisted_5, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(flatNodes.value, (node) => {
              return openBlock(), createElementBlock("button", {
                key: node.id,
                type: "button",
                class: normalizeClass(["w-full text-left text-xs py-1 truncate rounded hover:bg-gray-100", selectedId.value === node.id ? "bg-blue-50 text-blue-700" : "text-gray-700"]),
                style: normalizeStyle({ paddingLeft: `${(node.level - 1) * 12 + 8}px` }),
                onClick: ($event) => selectedId.value = node.id
              }, toDisplayString(node.label), 15, _hoisted_6);
            }), 128)),
            !flatNodes.value.length && !loading.value ? (openBlock(), createElementBlock("p", _hoisted_7, " No headings yet. Load from skill or edit markdown. ")) : createCommentVNode("", true)
          ]),
          __props.skills?.length ? (openBlock(), createElementBlock("p", _hoisted_8, " Skills: " + toDisplayString(__props.skills.join(", ")), 1)) : createCommentVNode("", true)
        ]),
        createBaseVNode("section", _hoisted_9, [
          createBaseVNode("div", _hoisted_10, [
            createBaseVNode("span", _hoisted_11, toDisplayString(__props.output), 1),
            editable.value ? (openBlock(), createElementBlock("div", _hoisted_12, [
              !isEditing.value ? (openBlock(), createElementBlock("button", {
                key: 0,
                class: "text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50",
                onClick: startEdit
              }, " Edit ")) : createCommentVNode("", true),
              isEditing.value ? (openBlock(), createElementBlock("button", {
                key: 1,
                class: "text-xs px-2 py-1 rounded bg-blue-600 text-white disabled:opacity-50",
                disabled: saving.value || !isDirty.value,
                "data-testid": "save-components",
                onClick: saveDoc
              }, " Save ", 8, _hoisted_13)) : createCommentVNode("", true),
              isEditing.value ? (openBlock(), createElementBlock("button", {
                key: 2,
                class: "text-xs px-2 py-1 rounded border border-gray-300",
                onClick: _cache[0] || (_cache[0] = ($event) => {
                  isEditing.value = false;
                  draft.value = content.value;
                })
              }, " Cancel ")) : createCommentVNode("", true)
            ])) : createCommentVNode("", true)
          ]),
          error.value ? (openBlock(), createElementBlock("p", _hoisted_14, toDisplayString(error.value), 1)) : createCommentVNode("", true),
          loading.value ? (openBlock(), createElementBlock("div", _hoisted_15, " Loading… ")) : isEditing.value && editable.value ? withDirectives((openBlock(), createElementBlock("textarea", {
            key: 2,
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => draft.value = $event),
            class: "flex-1 p-4 font-mono text-sm resize-none outline-none border-0",
            spellcheck: "false",
            "data-testid": "component-editor"
          }, null, 512)), [
            [vModelText, draft.value]
          ]) : (openBlock(), createElementBlock("div", _hoisted_16, [
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
