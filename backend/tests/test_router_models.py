import pytest
from pydantic import ValidationError

from app.agent.models.router import RouterOutput


def test_router_output_accepts_rag_and_chat():
    r = RouterOutput(next_agent="rag", reasoning="user asked about uploaded doc")
    assert r.next_agent == "rag"
    assert r.reasoning


def test_router_output_rejects_unknown_agent():
    with pytest.raises(ValidationError):
        RouterOutput(next_agent="code", reasoning="x")
