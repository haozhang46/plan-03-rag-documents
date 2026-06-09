from app.agent.graph import _build_linear_graph


def build(checkpointer=None):
    return _build_linear_graph(checkpointer=checkpointer)
