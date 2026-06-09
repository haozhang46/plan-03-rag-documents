from app.agent.graphs.parallel import build_parallel_graph


def build(checkpointer=None):
    return build_parallel_graph(checkpointer=checkpointer)
