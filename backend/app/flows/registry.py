from app.flows.builders import default, knowledge, linear_rag, parallel, supervisor
from app.flows.specs import FlowSpec

FLOW_SPECS: tuple[FlowSpec, ...] = (
    FlowSpec(
        flow_id="default",
        title="Default (env)",
        description="Uses SUPERVISOR_MODE and DISPATCH_MODE from environment.",
        builder=default.build,
    ),
    FlowSpec(
        flow_id="linear-rag",
        title="Linear RAG",
        description="prepare → summarize? → rag → chat",
        builder=linear_rag.build,
    ),
    FlowSpec(
        flow_id="supervisor",
        title="Supervisor",
        description="route ⇄ rag | code → chat",
        builder=supervisor.build,
    ),
    FlowSpec(
        flow_id="parallel",
        title="Parallel Map-Reduce",
        description="Dispatch rag/code/chat workers then reduce.",
        builder=parallel.build,
    ),
    FlowSpec(
        flow_id="knowledge-rag",
        title="Knowledge / notes",
        description="RAG-focused supervisor flow for document Q&A.",
        builder=knowledge.build,
    ),
)


class GraphRegistry:
    def __init__(self, graphs: dict, specs: dict[str, FlowSpec]):
        self.graphs = graphs
        self.specs = specs

    @classmethod
    def load_all(cls, checkpointer=None) -> "GraphRegistry":
        graphs = {}
        specs: dict[str, FlowSpec] = {}
        for spec in FLOW_SPECS:
            graphs[spec.flow_id] = spec.builder(checkpointer)
            specs[spec.flow_id] = spec
        return cls(graphs=graphs, specs=specs)

    def get(self, flow_id: str):
        if flow_id not in self.graphs:
            raise KeyError(flow_id)
        return self.graphs[flow_id]

    def get_spec(self, flow_id: str) -> FlowSpec:
        if flow_id not in self.specs:
            raise KeyError(flow_id)
        return self.specs[flow_id]

    def list_flows(self) -> list[dict]:
        return [
            {
                "flow_id": spec.flow_id,
                "title": spec.title,
                "description": spec.description,
                "default_skill_names": list(spec.default_skill_names),
            }
            for spec in FLOW_SPECS
        ]
