from unittest.mock import MagicMock, patch

from app.adapters.portainer import fetch_portainer_summary


def test_portainer_unconfigured():
    summary = fetch_portainer_summary(None, None)
    assert summary.configured is False
    assert summary.reachable is False


@patch("app.adapters.portainer.httpx.Client")
def test_portainer_success(mock_client_cls):
    mock_client = MagicMock()
    mock_client_cls.return_value.__enter__.return_value = mock_client

    status_resp = MagicMock()
    status_resp.status_code = 200
    status_resp.raise_for_status = MagicMock()

    stacks_resp = MagicMock()
    stacks_resp.status_code = 200
    stacks_resp.raise_for_status = MagicMock()
    stacks_resp.json.return_value = [{"Id": 1}, {"Id": 2}]

    endpoints_resp = MagicMock()
    endpoints_resp.status_code = 200
    endpoints_resp.raise_for_status = MagicMock()
    endpoints_resp.json.return_value = [{"Id": 3}]

    containers_resp = MagicMock()
    containers_resp.status_code = 200
    containers_resp.json.return_value = [{"Id": "a"}, {"Id": "b"}, {"Id": "c"}]

    mock_client.get.side_effect = [status_resp, stacks_resp, endpoints_resp, containers_resp]

    summary = fetch_portainer_summary("http://portainer:9000", "token")
    assert summary.configured is True
    assert summary.reachable is True
    assert summary.stack_count == 2
    assert summary.endpoint_count == 1
    assert summary.running_containers == 3


@patch("app.adapters.portainer.httpx.Client")
def test_portainer_unreachable(mock_client_cls):
    import httpx

    mock_client = MagicMock()
    mock_client_cls.return_value.__enter__.return_value = mock_client
    mock_client.get.side_effect = httpx.ConnectError("connection refused")

    summary = fetch_portainer_summary("http://portainer:9000", None)
    assert summary.configured is True
    assert summary.reachable is False
    assert summary.error is not None
