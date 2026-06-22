import json
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


class FakeChunk:
    def __init__(self, content: str):
        self.content = content


async def _fake_astream_message_only(*args, **kwargs):
    yield {
        "event": "on_chat_model_stream",
        "data": {"chunk": FakeChunk("hello")},
    }
    yield {
        "event": "on_chain_end",
        "name": "LangGraph",
        "data": {"output": {}},
    }


async def _fake_astream_with_tools(*args, **kwargs):
    yield {
        "event": "on_tool_start",
        "name": "web_search",
        "run_id": "run-1",
        "data": {"input": {"query": "test"}},
    }
    yield {
        "event": "on_tool_end",
        "name": "web_search",
        "run_id": "run-1",
        "data": {"output": "search result text"},
    }
    yield {
        "event": "on_chain_end",
        "name": "LangGraph",
        "data": {"output": {}},
    }


def _parse_sse_events(body: str) -> list[tuple[str, str]]:
    """Parse SSE body into list of (event_type, data_json_string)."""
    events = []
    current_event = "message"
    for line in body.split("\n"):
        if line.startswith("event: "):
            current_event = line[7:].strip()
        elif line.startswith("data: "):
            events.append((current_event, line[6:].strip()))
    return events


def _resolve_graph_patch(astream_fn=_fake_astream_message_only):
    mock_graph = MagicMock()
    mock_graph.astream_events = astream_fn
    mock_spec = type("Spec", (), {"default_skill_names": []})()
    return patch(
        "app.api.routes.chat._resolve_graph",
        return_value=(mock_graph, mock_spec),
    )


@pytest.mark.asyncio
async def test_sse_stream_yields_trace_event():
    with patch("app.api.routes.chat.get_langfuse_client") as mock_lf:
        mock_client = MagicMock()
        mock_client.create_trace_id.return_value = "test-trace-123"
        mock_lf.return_value = mock_client

        with _resolve_graph_patch():
            client = TestClient(app)
            response = client.post(
                "/v1/chat",
                json={"thread_id": "t1", "message": "hi"},
                headers={"Authorization": "Bearer test"},
            )

    assert response.status_code == 200
    events = _parse_sse_events(response.text)
    event_types = [evt for evt, _ in events]

    assert "trace" in event_types, f"Expected trace event, got: {event_types}"

    for evt, data in events:
        if evt == "trace":
            parsed = json.loads(data)
            assert parsed["trace_id"] == "test-trace-123"
            assert "langfuse_url" in parsed
            break
    else:
        pytest.fail("No trace event found")


@pytest.mark.asyncio
async def test_sse_stream_yields_tool_events():
    mock_graph = MagicMock()
    mock_graph.astream_events = _fake_astream_with_tools
    mock_spec = type("Spec", (), {"default_skill_names": []})()

    with patch("app.api.routes.chat._resolve_graph", return_value=(mock_graph, mock_spec)):
        client = TestClient(app)
        response = client.post(
            "/v1/chat",
            json={"thread_id": "t1", "message": "search test"},
            headers={"Authorization": "Bearer test"},
        )

    assert response.status_code == 200
    events = _parse_sse_events(response.text)
    event_types = [evt for evt, _ in events]

    assert "tool_start" in event_types, f"Expected tool_start, got: {event_types}"
    assert "tool_end" in event_types, f"Expected tool_end, got: {event_types}"

    for evt, data in events:
        if evt == "tool_start":
            parsed = json.loads(data)
            assert parsed["name"] == "web_search"
            assert parsed["call_id"] == "run-1"
            assert parsed["input"] == {"query": "test"}
            break
    else:
        pytest.fail("No tool_start event found")

    for evt, data in events:
        if evt == "tool_end":
            parsed = json.loads(data)
            assert parsed["name"] == "web_search"
            assert parsed["call_id"] == "run-1"
            assert parsed["output"] == "search result text"
            break
    else:
        pytest.fail("No tool_end event found")


@pytest.mark.asyncio
async def test_sse_stream_done_event():
    with _resolve_graph_patch():
        client = TestClient(app)
        response = client.post(
            "/v1/chat",
            json={"thread_id": "t1", "message": "hi"},
            headers={"Authorization": "Bearer test"},
        )

    assert response.status_code == 200
    events = _parse_sse_events(response.text)
    event_types = [evt for evt, _ in events]
    assert "done" in event_types, f"Expected done event, got: {event_types}"
