from langchain_core.messages import HumanMessage

from app.agent.routing import heuristic_next_agent, route_after_planner


def test_heuristic_rag_when_docs_and_doc_keywords():
    state = {
        "messages": [HumanMessage(content="summarize the uploaded pdf")],
        "document_ids": ["doc-1"],
    }
    assert heuristic_next_agent(state) == "rag"


def test_heuristic_chat_when_no_document_ids():
    state = {
        "messages": [HumanMessage(content="summarize the uploaded pdf")],
        "document_ids": [],
    }
    assert heuristic_next_agent(state) == "chat"


def test_heuristic_chat_when_rag_already_completed():
    state = {
        "messages": [HumanMessage(content="summarize the uploaded pdf")],
        "document_ids": ["doc-1"],
        "rag_completed": True,
    }
    assert heuristic_next_agent(state) == "chat"


def test_heuristic_chat_when_citations_present():
    state = {
        "messages": [HumanMessage(content="summarize the uploaded pdf")],
        "document_ids": ["doc-1"],
        "citations": ["c1"],
    }
    assert heuristic_next_agent(state) == "chat"


def test_route_after_planner_uses_state_next_agent():
    state = {"next_agent": "chat"}
    assert route_after_planner(state) == "chat"


def test_route_after_planner_defaults_to_heuristic():
    state = {
        "messages": [HumanMessage(content="hello")],
    }
    assert route_after_planner(state) == "chat"
