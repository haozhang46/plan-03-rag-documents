import { d as defineComponent, a as onMounted, l as onUnmounted, w as watch, o as openBlock, b as createElementBlock, e as createBaseVNode, t as toDisplayString, g as createCommentVNode, j as withDirectives, v as vModelText, F as Fragment, f as renderList, n as normalizeClass, c as createBlock, T as Teleport, m as withModifiers, k as normalizeStyle, h as createVNode, i as computed, r as ref, p as normalizeWorkspacePath } from "./index-CRlMfF3U.js";
import { _ as _sfc_main$1 } from "./MarkdownPreview.vue_vue_type_script_setup_true_lang-CGx813Ou.js";
function defaultRuleContent(path) {
  const name = path.split("/").pop() ?? path;
  if (name.toUpperCase() === "CLAUDE.MD") {
    return "@AGENTS.md\n\n# Claude-Specific Instructions\n\n## Behavioral Rules\n\n- Follow the project rules in AGENTS.md exactly.\n";
  }
  if (name.toUpperCase() === "AGENTS.MD") {
    return "# Project Agent Rules\n\n## Stack\n\n_Describe stack and conventions here._\n\n## What NOT to Do\n\n-\n";
  }
  return `# ${name.replace(/\.md$/i, "")}

_Agent instructions for this file._
`;
}
const _hoisted_1 = { class: "flex flex-1 min-h-0" };
const _hoisted_2 = { class: "p-2 border-b border-gray-200 flex items-center justify-between gap-1" };
const _hoisted_3 = { class: "text-xs font-medium text-gray-500" };
const _hoisted_4 = {
  key: 0,
  class: "p-2 border-b border-gray-200 space-y-2 bg-white"
};
const _hoisted_5 = { class: "flex-1 overflow-y-auto" };
const _hoisted_6 = ["onClick", "onContextmenu"];
const _hoisted_7 = { class: "flex items-center gap-1.5 min-w-0" };
const _hoisted_8 = { class: "truncate" };
const _hoisted_9 = {
  key: 0,
  class: "w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0",
  "data-testid": "file-updated-dot",
  "aria-label": "Updated by AI"
};
const _hoisted_10 = ["onClick", "onContextmenu"];
const _hoisted_11 = { class: "flex items-center gap-1.5 min-w-0" };
const _hoisted_12 = { class: "truncate" };
const _hoisted_13 = {
  key: 0,
  class: "w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0",
  "data-testid": "file-updated-dot",
  "aria-label": "Updated by AI"
};
const _hoisted_14 = {
  key: 0,
  class: "p-3 text-xs text-gray-400"
};
const _hoisted_15 = ["disabled"];
const _hoisted_16 = { class: "flex-1 flex flex-col min-w-0" };
const _hoisted_17 = { class: "flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white" };
const _hoisted_18 = { class: "text-sm font-medium text-gray-700 truncate" };
const _hoisted_19 = {
  key: 0,
  class: "ml-auto flex gap-2"
};
const _hoisted_20 = ["disabled"];
const _hoisted_21 = ["disabled", "data-testid"];
const _hoisted_22 = ["data-testid"];
const _hoisted_23 = {
  key: 0,
  class: "px-4 py-1 text-xs text-red-600 bg-red-50"
};
const _hoisted_24 = {
  key: 1,
  class: "flex-1 flex items-center justify-center text-sm text-gray-400"
};
const _hoisted_25 = ["data-testid"];
const _hoisted_26 = {
  key: 3,
  class: "flex-1 overflow-y-auto p-6 w-[95%] self-center box-border"
};
const _hoisted_27 = {
  key: 4,
  class: "flex-1 flex items-center justify-center text-sm text-gray-400"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MarkdownFilePanel",
  props: {
    api: {},
    mode: {},
    docsDir: { default: "docs" },
    sidebarTitle: { default: "Documents" },
    allowDelete: { type: Boolean, default: true },
    files: {},
    defaultFiles: {},
    editable: { type: Boolean, default: true },
    componentId: {}
  },
  setup(__props) {
    const props = __props;
    const docsDir = computed(() => props.docsDir);
    const isFileListMode = computed(() => props.mode === "file-list");
    const isEditable = computed(() => props.editable !== false);
    const directoryFiles = ref([]);
    const fileListFiles = ref([]);
    const selectedPath = ref(null);
    const content = ref("");
    const draft = ref("");
    const loading = ref(false);
    const saving = ref(false);
    const error = ref(null);
    const isEditing = ref(false);
    const isNewFile = ref(false);
    const showAddForm = ref(false);
    const newPath = ref("");
    const newLabel = ref("");
    const contextMenu = ref(null);
    const updatedPaths = ref(/* @__PURE__ */ new Set());
    let unsubscribeFileWrites;
    const isDirty = computed(() => isEditing.value && draft.value !== content.value);
    const canSave = computed(() => isEditing.value && (isDirty.value || isNewFile.value));
    const canAddToChat = computed(() => typeof props.api.addToChat === "function");
    const selectedListFile = computed(
      () => fileListFiles.value.find((f) => f.path === selectedPath.value)
    );
    function closeContextMenu() {
      contextMenu.value = null;
    }
    function isPathUpdated(path) {
      return updatedPaths.value.has(normalizeWorkspacePath(path));
    }
    function isPathInSidebar(path) {
      if (isFileListMode.value) {
        return fileListFiles.value.some((f) => normalizeWorkspacePath(f.path) === path);
      }
      return directoryFiles.value.some((f) => normalizeWorkspacePath(f.path) === path);
    }
    function clearUpdatedDot(path) {
      const normalized = normalizeWorkspacePath(path);
      if (!updatedPaths.value.has(normalized)) return;
      const next = new Set(updatedPaths.value);
      next.delete(normalized);
      updatedPaths.value = next;
    }
    async function reloadSelectedFile() {
      if (!selectedPath.value) return;
      loading.value = true;
      error.value = null;
      try {
        const file = await props.api.readWorkspaceFile(selectedPath.value);
        content.value = file.content;
        draft.value = file.content;
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      } finally {
        loading.value = false;
      }
    }
    async function onExternalFileWrite(path) {
      const normalized = normalizeWorkspacePath(path);
      if (selectedPath.value && normalizeWorkspacePath(selectedPath.value) === normalized) {
        await reloadSelectedFile();
        clearUpdatedDot(normalized);
        return;
      }
      if (isPathInSidebar(normalized)) {
        updatedPaths.value = new Set(updatedPaths.value).add(normalized);
      }
    }
    function onFileContextMenu(event, file) {
      event.preventDefault();
      contextMenu.value = { x: event.clientX, y: event.clientY, file };
    }
    async function onAddToChat() {
      const file = contextMenu.value?.file;
      if (!file || !props.api.addToChat) return;
      closeContextMenu();
      try {
        await props.api.addToChat({ path: file.path, label: file.label });
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      }
    }
    function onDocumentClick() {
      closeContextMenu();
    }
    function onDocumentKeydown(event) {
      if (event.key === "Escape") closeContextMenu();
    }
    function initFileList() {
      const source = props.files?.length ? props.files : props.defaultFiles ?? [];
      fileListFiles.value = [...source];
      if (!fileListFiles.value.some((f) => f.path === selectedPath.value)) {
        selectedPath.value = fileListFiles.value[0]?.path ?? null;
      }
    }
    async function loadDirectoryFileList() {
      loading.value = true;
      error.value = null;
      try {
        const { entries } = await props.api.listWorkspace(docsDir.value);
        directoryFiles.value = entries.filter((e) => e.type === "file" && e.name.endsWith(".md")).map((e) => ({ path: e.path, name: e.name }));
        if (!selectedPath.value && directoryFiles.value.length) {
          await selectDirectoryFile(directoryFiles.value[0].path);
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      } finally {
        loading.value = false;
      }
    }
    async function selectDirectoryFile(path) {
      clearUpdatedDot(path);
      loading.value = true;
      error.value = null;
      try {
        const file = await props.api.readWorkspaceFile(path);
        selectedPath.value = path;
        content.value = file.content;
        draft.value = file.content;
        isEditing.value = false;
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      } finally {
        loading.value = false;
      }
    }
    async function loadListFile(path) {
      if (!path) return;
      clearUpdatedDot(path);
      loading.value = true;
      error.value = null;
      isEditing.value = false;
      isNewFile.value = false;
      try {
        const file = await props.api.readWorkspaceFile(path);
        selectedPath.value = path;
        content.value = file.content;
        draft.value = file.content;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("ENOENT") || message.includes("not found")) {
          selectedPath.value = path;
          const initial = defaultRuleContent(path);
          content.value = initial;
          draft.value = initial;
          if (isEditable.value) {
            isEditing.value = true;
            isNewFile.value = true;
          }
        } else {
          content.value = "";
          draft.value = "";
          error.value = message;
        }
      } finally {
        loading.value = false;
      }
    }
    async function createDoc() {
      const name = window.prompt("New document name (e.g. PRD.md):", "PRD.md");
      if (!name?.trim()) return;
      const fileName = name.endsWith(".md") ? name : `${name}.md`;
      const path = `${docsDir.value}/${fileName}`;
      await props.api.writeWorkspaceFile(path, `# ${fileName.replace(/\.md$/, "")}

`);
      await loadDirectoryFileList();
      await selectDirectoryFile(path);
      isEditing.value = true;
    }
    async function saveDoc() {
      if (!selectedPath.value) return;
      saving.value = true;
      error.value = null;
      try {
        const body = isEditing.value ? draft.value : content.value;
        await props.api.writeWorkspaceFile(selectedPath.value, body);
        content.value = body;
        draft.value = body;
        isEditing.value = false;
        isNewFile.value = false;
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      } finally {
        saving.value = false;
      }
    }
    async function persistFileList() {
      if (!props.api.persistRuleFiles || !props.componentId) return;
      await props.api.persistRuleFiles(fileListFiles.value, props.componentId);
    }
    async function deleteDoc() {
      if (!selectedPath.value) return;
      if (!window.confirm(`Delete ${selectedPath.value}?`)) return;
      error.value = null;
      const path = selectedPath.value;
      try {
        if (!isNewFile.value) {
          await props.api.deleteWorkspacePath(path);
        }
        if (isFileListMode.value) {
          fileListFiles.value = fileListFiles.value.filter((f) => f.path !== path);
          const next = fileListFiles.value[0]?.path ?? null;
          selectedPath.value = next;
          content.value = "";
          draft.value = "";
          isEditing.value = false;
          isNewFile.value = false;
          if (next) {
            await loadListFile(next);
          }
          try {
            await persistFileList();
          } catch (err) {
            error.value = err instanceof Error ? err.message : String(err);
          }
        } else {
          selectedPath.value = null;
          content.value = "";
          draft.value = "";
          await loadDirectoryFileList();
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      }
    }
    function startEdit() {
      draft.value = content.value;
      isEditing.value = true;
    }
    function cancelEdit() {
      draft.value = content.value;
      isEditing.value = false;
    }
    function openAddForm() {
      newPath.value = "";
      newLabel.value = "";
      showAddForm.value = true;
    }
    function cancelAdd() {
      showAddForm.value = false;
      newPath.value = "";
      newLabel.value = "";
    }
    async function confirmAdd() {
      const path = newPath.value.trim();
      if (!path) {
        error.value = "File path is required.";
        return;
      }
      if (fileListFiles.value.some((f) => f.path === path)) {
        error.value = `File already in list: ${path}`;
        return;
      }
      const label = newLabel.value.trim() || path.split("/").pop() || path;
      fileListFiles.value = [...fileListFiles.value, { path, label }];
      selectedPath.value = path;
      showAddForm.value = false;
      newPath.value = "";
      newLabel.value = "";
      await loadListFile(path);
      try {
        await persistFileList();
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      }
    }
    onMounted(() => {
      document.addEventListener("click", onDocumentClick);
      document.addEventListener("keydown", onDocumentKeydown);
      unsubscribeFileWrites = props.api.subscribeFileWrites?.((path) => void onExternalFileWrite(path));
      if (isFileListMode.value) {
        initFileList();
        if (selectedPath.value) void loadListFile(selectedPath.value);
      } else {
        void loadDirectoryFileList();
      }
    });
    onUnmounted(() => {
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onDocumentKeydown);
      unsubscribeFileWrites?.();
    });
    watch(
      () => docsDir.value,
      () => {
        if (!isFileListMode.value) {
          void loadDirectoryFileList();
        }
      }
    );
    watch(
      () => props.files,
      () => {
        if (isFileListMode.value) {
          initFileList();
        }
      },
      { deep: true }
    );
    watch(selectedPath, (path, prev) => {
      if (isFileListMode.value && path && path !== prev) {
        void loadListFile(path);
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("aside", {
          class: normalizeClass(["border-r border-gray-200 bg-gray-50 flex flex-col shrink-0", isFileListMode.value ? "w-52" : "w-48"])
        }, [
          createBaseVNode("div", _hoisted_2, [
            createBaseVNode("span", _hoisted_3, toDisplayString(__props.sidebarTitle), 1),
            isFileListMode.value && isEditable.value ? (openBlock(), createElementBlock("button", {
              key: 0,
              type: "button",
              class: "text-xs text-blue-600 hover:underline",
              "data-testid": "add-rule-file",
              onClick: openAddForm
            }, " + Add ")) : !isFileListMode.value ? (openBlock(), createElementBlock("button", {
              key: 1,
              class: "text-xs text-blue-600 hover:underline",
              onClick: createDoc
            }, " + New ")) : createCommentVNode("", true)
          ]),
          isFileListMode.value && showAddForm.value ? (openBlock(), createElementBlock("div", _hoisted_4, [
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => newPath.value = $event),
              type: "text",
              placeholder: "fe/GEMINI.md",
              class: "w-full text-xs px-2 py-1 border border-gray-300 rounded",
              "data-testid": "new-rule-path"
            }, null, 512), [
              [vModelText, newPath.value]
            ]),
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => newLabel.value = $event),
              type: "text",
              placeholder: "Label (optional)",
              class: "w-full text-xs px-2 py-1 border border-gray-300 rounded"
            }, null, 512), [
              [vModelText, newLabel.value]
            ]),
            createBaseVNode("div", { class: "flex gap-1" }, [
              createBaseVNode("button", {
                type: "button",
                class: "text-xs px-2 py-1 rounded bg-blue-600 text-white",
                "data-testid": "confirm-add-rule",
                onClick: confirmAdd
              }, " Add "),
              createBaseVNode("button", {
                type: "button",
                class: "text-xs px-2 py-1 rounded border border-gray-300",
                onClick: cancelAdd
              }, " Cancel ")
            ])
          ])) : createCommentVNode("", true),
          createBaseVNode("div", _hoisted_5, [
            isFileListMode.value ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(fileListFiles.value, (file) => {
              return openBlock(), createElementBlock("button", {
                key: file.path,
                type: "button",
                class: normalizeClass(["w-full text-left px-3 py-2 text-xs border-b border-gray-100 hover:bg-gray-100 truncate", selectedPath.value === file.path ? "bg-blue-50 text-blue-700" : "text-gray-700"]),
                onClick: ($event) => selectedPath.value = file.path,
                onContextmenu: ($event) => onFileContextMenu($event, file)
              }, [
                createBaseVNode("span", _hoisted_7, [
                  createBaseVNode("span", _hoisted_8, toDisplayString(file.label), 1),
                  isPathUpdated(file.path) ? (openBlock(), createElementBlock("span", _hoisted_9)) : createCommentVNode("", true)
                ])
              ], 42, _hoisted_6);
            }), 128)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(directoryFiles.value, (file) => {
                return openBlock(), createElementBlock("button", {
                  key: file.path,
                  class: normalizeClass(["w-full text-left px-3 py-2 text-xs border-b border-gray-100 hover:bg-gray-100 truncate", selectedPath.value === file.path ? "bg-blue-50 text-blue-700" : "text-gray-700"]),
                  "data-testid": "markdown-file-item",
                  onClick: ($event) => selectDirectoryFile(file.path),
                  onContextmenu: ($event) => onFileContextMenu($event, { path: file.path, label: file.name })
                }, [
                  createBaseVNode("span", _hoisted_11, [
                    createBaseVNode("span", _hoisted_12, toDisplayString(file.name), 1),
                    isPathUpdated(file.path) ? (openBlock(), createElementBlock("span", _hoisted_13)) : createCommentVNode("", true)
                  ])
                ], 42, _hoisted_10);
              }), 128)),
              !directoryFiles.value.length && !loading.value ? (openBlock(), createElementBlock("p", _hoisted_14, " No markdown files yet. ")) : createCommentVNode("", true)
            ], 64))
          ])
        ], 2),
        (openBlock(), createBlock(Teleport, { to: "body" }, [
          contextMenu.value ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: "fixed z-50 min-w-[140px] rounded-md border border-gray-200 bg-white py-1 shadow-lg",
            style: normalizeStyle({ left: `${contextMenu.value.x}px`, top: `${contextMenu.value.y}px` }),
            "data-testid": "markdown-file-context-menu",
            onClick: _cache[2] || (_cache[2] = withModifiers(() => {
            }, ["stop"]))
          }, [
            createBaseVNode("button", {
              type: "button",
              class: "w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed",
              "data-testid": "markdown-add-to-chat",
              disabled: !canAddToChat.value,
              onClick: onAddToChat
            }, " Add to chat ", 8, _hoisted_15)
          ], 4)) : createCommentVNode("", true)
        ])),
        createBaseVNode("section", _hoisted_16, [
          createBaseVNode("div", _hoisted_17, [
            createBaseVNode("span", _hoisted_18, toDisplayString(isFileListMode.value ? selectedListFile.value?.path ?? selectedPath.value ?? "Select a document" : selectedPath.value ?? "Select a document"), 1),
            !isFileListMode.value || isEditable.value ? (openBlock(), createElementBlock("div", _hoisted_19, [
              selectedPath.value && !isEditing.value ? (openBlock(), createElementBlock("button", {
                key: 0,
                type: "button",
                class: "text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50",
                disabled: loading.value || !selectedPath.value,
                onClick: startEdit
              }, " Edit ", 8, _hoisted_20)) : createCommentVNode("", true),
              isEditing.value ? (openBlock(), createElementBlock("button", {
                key: 1,
                type: "button",
                class: "text-xs px-2 py-1 rounded bg-blue-600 text-white disabled:opacity-50",
                disabled: saving.value || (isFileListMode.value ? !canSave.value : !isDirty.value),
                "data-testid": isFileListMode.value ? "save-rule-file" : void 0,
                onClick: saveDoc
              }, " Save ", 8, _hoisted_21)) : createCommentVNode("", true),
              isEditing.value ? (openBlock(), createElementBlock("button", {
                key: 2,
                type: "button",
                class: "text-xs px-2 py-1 rounded border border-gray-300",
                onClick: _cache[3] || (_cache[3] = ($event) => isFileListMode.value ? cancelEdit() : (isEditing.value = false, draft.value = content.value))
              }, " Cancel ")) : createCommentVNode("", true),
              selectedPath.value && __props.allowDelete ? (openBlock(), createElementBlock("button", {
                key: 3,
                type: "button",
                class: "text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50",
                "data-testid": isFileListMode.value ? "delete-rule-file" : void 0,
                onClick: deleteDoc
              }, " Delete ", 8, _hoisted_22)) : createCommentVNode("", true)
            ])) : createCommentVNode("", true)
          ]),
          error.value ? (openBlock(), createElementBlock("p", _hoisted_23, toDisplayString(error.value), 1)) : createCommentVNode("", true),
          loading.value ? (openBlock(), createElementBlock("div", _hoisted_24, " Loading… ")) : isEditing.value && (!isFileListMode.value || isEditable.value) ? withDirectives((openBlock(), createElementBlock("textarea", {
            key: 2,
            "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => draft.value = $event),
            class: "flex-1 w-[95%] self-center p-4 font-mono text-sm resize-none outline-none border-0 box-border",
            spellcheck: "false",
            "data-testid": isFileListMode.value ? "rule-file-editor" : void 0
          }, null, 8, _hoisted_25)), [
            [vModelText, draft.value]
          ]) : selectedPath.value && content.value ? (openBlock(), createElementBlock("div", _hoisted_26, [
            createVNode(_sfc_main$1, { content: content.value }, null, 8, ["content"])
          ])) : (openBlock(), createElementBlock("div", _hoisted_27, toDisplayString(isFileListMode.value ? "Select a rule file or add a new one." : "Create or select a PRD document."), 1))
        ])
      ]);
    };
  }
});
export {
  _sfc_main as _
};
