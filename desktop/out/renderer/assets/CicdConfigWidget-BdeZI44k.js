import { d as defineComponent, a as onMounted, o as openBlock, b as createElementBlock, e as createBaseVNode, t as toDisplayString, g as createCommentVNode, F as Fragment, n as normalizeClass, f as renderList, r as ref, c as createBlock } from "./index-CRlMfF3U.js";
const _hoisted_1 = { class: "flex flex-1 min-h-0 flex-col overflow-y-auto" };
const _hoisted_2 = {
  key: 0,
  class: "px-4 py-1 text-xs text-red-600 bg-red-50"
};
const _hoisted_3 = {
  key: 1,
  class: "flex-1 flex items-center justify-center text-sm text-gray-400"
};
const _hoisted_4 = {
  key: 0,
  class: "p-4 border-b border-gray-100"
};
const _hoisted_5 = { class: "grid grid-cols-1 sm:grid-cols-2 gap-3" };
const _hoisted_6 = {
  key: 0,
  class: "card p-3"
};
const _hoisted_7 = {
  key: 0,
  class: "text-xs text-gray-600 mt-1"
};
const _hoisted_8 = {
  key: 1,
  class: "text-xs text-gray-600"
};
const _hoisted_9 = {
  key: 2,
  class: "text-xs text-red-600 mt-1"
};
const _hoisted_10 = {
  key: 1,
  class: "card p-3"
};
const _hoisted_11 = {
  key: 0,
  class: "text-xs text-gray-600 mt-1"
};
const _hoisted_12 = {
  key: 1,
  class: "text-xs text-gray-600"
};
const _hoisted_13 = {
  key: 2,
  class: "text-xs text-red-600 mt-1"
};
const _hoisted_14 = {
  key: 0,
  class: "text-xs text-gray-500 mt-2"
};
const _hoisted_15 = { class: "p-4 border-b border-gray-100 grid grid-cols-2 gap-3 sm:grid-cols-4" };
const _hoisted_16 = { class: "card p-3" };
const _hoisted_17 = { class: "text-sm font-medium text-gray-800" };
const _hoisted_18 = { class: "card p-3" };
const _hoisted_19 = { class: "text-sm font-medium text-gray-800" };
const _hoisted_20 = { class: "card p-3" };
const _hoisted_21 = { class: "card p-3" };
const _hoisted_22 = { class: "text-sm font-medium text-gray-800" };
const _hoisted_23 = {
  key: 1,
  class: "p-4 border-b border-gray-100"
};
const _hoisted_24 = { class: "space-y-1 text-xs" };
const _hoisted_25 = { class: "font-medium text-gray-800" };
const _hoisted_26 = { class: "text-gray-500" };
const _hoisted_27 = {
  key: 2,
  class: "p-4 border-b border-gray-100"
};
const _hoisted_28 = { class: "space-y-2" };
const _hoisted_29 = { class: "font-medium text-gray-800" };
const _hoisted_30 = {
  key: 0,
  class: "text-gray-500"
};
const _hoisted_31 = {
  key: 1,
  class: "text-amber-600"
};
const _hoisted_32 = {
  key: 3,
  class: "p-4 border-b border-gray-100"
};
const _hoisted_33 = { class: "space-y-2" };
const _hoisted_34 = { class: "font-medium text-gray-800" };
const _hoisted_35 = {
  key: 0,
  class: "text-gray-500"
};
const _hoisted_36 = {
  key: 1,
  class: "text-amber-600"
};
const _hoisted_37 = {
  key: 4,
  class: "p-4 border-b border-gray-100"
};
const _hoisted_38 = { class: "w-full text-xs" };
const _hoisted_39 = { class: "py-1.5 font-medium" };
const _hoisted_40 = { class: "py-1.5 text-gray-600 font-mono" };
const _hoisted_41 = { class: "py-1.5 text-gray-600 font-mono" };
const _hoisted_42 = {
  key: 5,
  class: "p-4 border-b border-gray-100"
};
const _hoisted_43 = { class: "text-xs text-gray-700 space-y-1 font-mono" };
const _hoisted_44 = {
  key: 6,
  class: "p-4 border-b border-gray-100"
};
const _hoisted_45 = { class: "text-xs font-semibold text-gray-600 mb-2" };
const _hoisted_46 = { class: "text-xs font-mono bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto m-0" };
const _hoisted_47 = {
  key: 7,
  class: "p-4"
};
const _hoisted_48 = { class: "text-xs font-mono bg-gray-50 p-3 rounded-lg whitespace-pre-wrap m-0 text-gray-700" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "WorkflowCicdPanel",
  props: {
    api: {}
  },
  setup(__props) {
    const props = __props;
    const config = ref(null);
    const resourceMarkdown = ref("");
    const topology = ref(null);
    const opsSummary = ref(null);
    const composeContent = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const platformLabel = {
      "docker-compose": "Docker Compose",
      kubernetes: "Kubernetes",
      unknown: "Not configured"
    };
    async function load() {
      loading.value = true;
      error.value = null;
      try {
        const [deploy, resources, topo, ops] = await Promise.all([
          props.api.fetchDeploymentConfig(),
          props.api.fetchResourceContext(),
          props.api.fetchTopology(),
          props.api.fetchOpsSummary()
        ]);
        config.value = deploy;
        resourceMarkdown.value = resources.markdown;
        topology.value = topo.topology;
        opsSummary.value = ops;
        if (deploy.composeFile) {
          try {
            const file = await props.api.readWorkspaceFile(deploy.composeFile);
            composeContent.value = file.content;
          } catch {
            composeContent.value = null;
          }
        } else {
          composeContent.value = null;
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      } finally {
        loading.value = false;
      }
    }
    onMounted(() => {
      void load();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", { class: "px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-2" }, [
          _cache[0] || (_cache[0] = createBaseVNode("h2", { class: "text-sm font-semibold text-gray-800" }, "CI/CD Deployment", -1)),
          createBaseVNode("button", {
            class: "ml-auto text-xs text-gray-500 hover:text-gray-700",
            onClick: load
          }, " Refresh ")
        ]),
        error.value ? (openBlock(), createElementBlock("p", _hoisted_2, toDisplayString(error.value), 1)) : createCommentVNode("", true),
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_3, " Loading deployment config… ")) : config.value ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
          opsSummary.value && (opsSummary.value.docker.configured || opsSummary.value.kubernetes.configured) ? (openBlock(), createElementBlock("section", _hoisted_4, [
            _cache[3] || (_cache[3] = createBaseVNode("h3", { class: "text-xs font-semibold text-gray-600 mb-2" }, "Runtime Ops", -1)),
            createBaseVNode("div", _hoisted_5, [
              opsSummary.value.docker.configured ? (openBlock(), createElementBlock("div", _hoisted_6, [
                _cache[1] || (_cache[1] = createBaseVNode("p", { class: "text-[10px] uppercase text-gray-500 mb-1" }, "Docker VPS (Portainer)", -1)),
                createBaseVNode("p", {
                  class: normalizeClass(["text-sm font-medium", opsSummary.value.docker.reachable ? "text-green-700" : "text-amber-700"])
                }, toDisplayString(opsSummary.value.docker.reachable ? "Connected" : "Unreachable"), 3),
                opsSummary.value.docker.stackCount != null ? (openBlock(), createElementBlock("p", _hoisted_7, " Stacks: " + toDisplayString(opsSummary.value.docker.stackCount), 1)) : createCommentVNode("", true),
                opsSummary.value.docker.runningContainers != null ? (openBlock(), createElementBlock("p", _hoisted_8, " Running containers: " + toDisplayString(opsSummary.value.docker.runningContainers), 1)) : createCommentVNode("", true),
                opsSummary.value.docker.error ? (openBlock(), createElementBlock("p", _hoisted_9, toDisplayString(opsSummary.value.docker.error), 1)) : createCommentVNode("", true)
              ])) : createCommentVNode("", true),
              opsSummary.value.kubernetes.configured ? (openBlock(), createElementBlock("div", _hoisted_10, [
                _cache[2] || (_cache[2] = createBaseVNode("p", { class: "text-[10px] uppercase text-gray-500 mb-1" }, "Kubernetes (Meshery)", -1)),
                createBaseVNode("p", {
                  class: normalizeClass(["text-sm font-medium", opsSummary.value.kubernetes.reachable ? "text-green-700" : "text-amber-700"])
                }, toDisplayString(opsSummary.value.kubernetes.reachable ? "Connected" : "Unreachable"), 3),
                opsSummary.value.kubernetes.version ? (openBlock(), createElementBlock("p", _hoisted_11, " Version: " + toDisplayString(opsSummary.value.kubernetes.version), 1)) : createCommentVNode("", true),
                opsSummary.value.kubernetes.connectionCount != null ? (openBlock(), createElementBlock("p", _hoisted_12, " Connections: " + toDisplayString(opsSummary.value.kubernetes.connectionCount), 1)) : createCommentVNode("", true),
                opsSummary.value.kubernetes.error ? (openBlock(), createElementBlock("p", _hoisted_13, toDisplayString(opsSummary.value.kubernetes.error), 1)) : createCommentVNode("", true)
              ])) : createCommentVNode("", true)
            ]),
            opsSummary.value.intentNodeCount != null ? (openBlock(), createElementBlock("p", _hoisted_14, " Intent topology nodes: " + toDisplayString(opsSummary.value.intentNodeCount), 1)) : createCommentVNode("", true)
          ])) : createCommentVNode("", true),
          createBaseVNode("section", _hoisted_15, [
            createBaseVNode("div", _hoisted_16, [
              _cache[4] || (_cache[4] = createBaseVNode("p", { class: "text-[10px] uppercase text-gray-500 mb-1" }, "Platform", -1)),
              createBaseVNode("p", _hoisted_17, toDisplayString(platformLabel[config.value.platform]), 1)
            ]),
            createBaseVNode("div", _hoisted_18, [
              _cache[5] || (_cache[5] = createBaseVNode("p", { class: "text-[10px] uppercase text-gray-500 mb-1" }, "Nodes / Services", -1)),
              createBaseVNode("p", _hoisted_19, toDisplayString(config.value.nodeCount ?? config.value.services.length ?? "—"), 1)
            ]),
            createBaseVNode("div", _hoisted_20, [
              _cache[6] || (_cache[6] = createBaseVNode("p", { class: "text-[10px] uppercase text-gray-500 mb-1" }, "Nginx", -1)),
              createBaseVNode("p", {
                class: normalizeClass(["text-sm font-medium", config.value.hasNginx ? "text-green-700" : "text-gray-500"])
              }, toDisplayString(config.value.hasNginx ? "Yes" : "No"), 3)
            ]),
            createBaseVNode("div", _hoisted_21, [
              _cache[7] || (_cache[7] = createBaseVNode("p", { class: "text-[10px] uppercase text-gray-500 mb-1" }, "Workflows", -1)),
              createBaseVNode("p", _hoisted_22, toDisplayString(config.value.workflowFiles.length), 1)
            ])
          ]),
          topology.value?.nodes?.length ? (openBlock(), createElementBlock("section", _hoisted_23, [
            _cache[8] || (_cache[8] = createBaseVNode("h3", { class: "text-xs font-semibold text-gray-600 mb-2" }, "Service Topology", -1)),
            createBaseVNode("div", _hoisted_24, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(topology.value.nodes, (node) => {
                return openBlock(), createElementBlock("div", {
                  key: node.id,
                  class: "bg-gray-50 rounded-lg px-3 py-2 font-mono"
                }, [
                  createBaseVNode("span", _hoisted_25, toDisplayString(node.id), 1),
                  createBaseVNode("span", _hoisted_26, " (" + toDisplayString(node.engine ?? node.kind) + ")", 1)
                ]);
              }), 128)),
              (openBlock(true), createElementBlock(Fragment, null, renderList(topology.value.edges, (edge, idx) => {
                return openBlock(), createElementBlock("div", {
                  key: `${edge.from}-${edge.to}-${idx}`,
                  class: "text-gray-600 px-3"
                }, toDisplayString(edge.from) + " → " + toDisplayString(edge.to), 1);
              }), 128))
            ])
          ])) : createCommentVNode("", true),
          config.value.databases.length ? (openBlock(), createElementBlock("section", _hoisted_27, [
            _cache[9] || (_cache[9] = createBaseVNode("h3", { class: "text-xs font-semibold text-gray-600 mb-2" }, "Databases", -1)),
            createBaseVNode("div", _hoisted_28, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(config.value.databases, (db) => {
                return openBlock(), createElementBlock("div", {
                  key: db.name,
                  class: "text-xs bg-gray-50 rounded-lg px-3 py-2 font-mono"
                }, [
                  createBaseVNode("span", _hoisted_29, toDisplayString(db.type) + "/" + toDisplayString(db.name), 1),
                  db.host ? (openBlock(), createElementBlock("span", _hoisted_30, " — " + toDisplayString(db.host) + toDisplayString(db.port ? `:${db.port}` : ""), 1)) : (openBlock(), createElementBlock("span", _hoisted_31, " — host not configured"))
                ]);
              }), 128))
            ])
          ])) : createCommentVNode("", true),
          config.value.caches.length ? (openBlock(), createElementBlock("section", _hoisted_32, [
            _cache[10] || (_cache[10] = createBaseVNode("h3", { class: "text-xs font-semibold text-gray-600 mb-2" }, "Cache (Redis)", -1)),
            createBaseVNode("div", _hoisted_33, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(config.value.caches, (cache) => {
                return openBlock(), createElementBlock("div", {
                  key: cache.name,
                  class: "text-xs bg-gray-50 rounded-lg px-3 py-2 font-mono"
                }, [
                  createBaseVNode("span", _hoisted_34, toDisplayString(cache.type) + "/" + toDisplayString(cache.name), 1),
                  cache.host ? (openBlock(), createElementBlock("span", _hoisted_35, " — " + toDisplayString(cache.host) + toDisplayString(cache.port ? `:${cache.port}` : ""), 1)) : (openBlock(), createElementBlock("span", _hoisted_36, " — host not configured"))
                ]);
              }), 128))
            ])
          ])) : createCommentVNode("", true),
          config.value.services.length ? (openBlock(), createElementBlock("section", _hoisted_37, [
            _cache[12] || (_cache[12] = createBaseVNode("h3", { class: "text-xs font-semibold text-gray-600 mb-2" }, "Compose services", -1)),
            createBaseVNode("table", _hoisted_38, [
              _cache[11] || (_cache[11] = createBaseVNode("thead", null, [
                createBaseVNode("tr", { class: "text-left text-gray-500 border-b" }, [
                  createBaseVNode("th", { class: "py-1 pr-2" }, "Service"),
                  createBaseVNode("th", { class: "py-1 pr-2" }, "Image"),
                  createBaseVNode("th", { class: "py-1" }, "Ports")
                ])
              ], -1)),
              createBaseVNode("tbody", null, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(config.value.services, (svc) => {
                  return openBlock(), createElementBlock("tr", {
                    key: svc.name,
                    class: "border-b border-gray-50"
                  }, [
                    createBaseVNode("td", _hoisted_39, toDisplayString(svc.name), 1),
                    createBaseVNode("td", _hoisted_40, toDisplayString(svc.image ?? "—"), 1),
                    createBaseVNode("td", _hoisted_41, toDisplayString(svc.ports?.join(", ") ?? "—"), 1)
                  ]);
                }), 128))
              ])
            ])
          ])) : createCommentVNode("", true),
          config.value.workflowFiles.length ? (openBlock(), createElementBlock("section", _hoisted_42, [
            _cache[13] || (_cache[13] = createBaseVNode("h3", { class: "text-xs font-semibold text-gray-600 mb-2" }, "GitHub Actions", -1)),
            createBaseVNode("ul", _hoisted_43, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(config.value.workflowFiles, (wf) => {
                return openBlock(), createElementBlock("li", { key: wf }, toDisplayString(wf), 1);
              }), 128))
            ])
          ])) : createCommentVNode("", true),
          composeContent.value ? (openBlock(), createElementBlock("section", _hoisted_44, [
            createBaseVNode("h3", _hoisted_45, toDisplayString(config.value.composeFile), 1),
            createBaseVNode("pre", _hoisted_46, [
              createBaseVNode("code", null, toDisplayString(composeContent.value), 1)
            ])
          ])) : createCommentVNode("", true),
          resourceMarkdown.value ? (openBlock(), createElementBlock("section", _hoisted_47, [
            _cache[14] || (_cache[14] = createBaseVNode("h3", { class: "text-xs font-semibold text-gray-600 mb-2" }, "Resource declarations", -1)),
            createBaseVNode("pre", _hoisted_48, toDisplayString(resourceMarkdown.value), 1)
          ])) : createCommentVNode("", true)
        ], 64)) : createCommentVNode("", true)
      ]);
    };
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CicdConfigWidget",
  props: {
    api: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$1, { api: __props.api }, null, 8, ["api"]);
    };
  }
});
export {
  _sfc_main as default
};
