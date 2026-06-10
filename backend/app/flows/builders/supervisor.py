from app.agent.graph import _build_supervisor_graph


def build(checkpointer=None):
    return _build_supervisor_graph(checkpointer=checkpointer)
