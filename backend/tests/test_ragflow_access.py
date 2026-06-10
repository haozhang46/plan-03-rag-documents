import pytest

from app.rag.access import RagAccessError, filter_allowed_dataset_ids


def test_rejects_unknown_dataset():
    allowed = {"ds-1", "ds-2"}
    try:
        filter_allowed_dataset_ids(["ds-1", "ds-evil"], allowed)
        assert False, "expected RagAccessError"
    except RagAccessError as exc:
        assert "ds-evil" in str(exc)


def test_empty_request_uses_defaults():
    allowed = {"ds-1", "ds-2"}
    out = filter_allowed_dataset_ids([], allowed, defaults=["ds-1"])
    assert out == ["ds-1"]


def test_empty_request_without_defaults_raises():
    with pytest.raises(RagAccessError):
        filter_allowed_dataset_ids([], {"ds-1"})
