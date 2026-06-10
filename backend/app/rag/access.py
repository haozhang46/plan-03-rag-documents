class RagAccessError(Exception):
    pass


def filter_allowed_dataset_ids(
    requested: list[str],
    allowed_ids: set[str],
    *,
    defaults: list[str] | None = None,
) -> list[str]:
    if requested:
        bad = [d for d in requested if d not in allowed_ids]
        if bad:
            raise RagAccessError(f"forbidden dataset_ids: {bad}")
        return requested
    if defaults:
        missing = [d for d in defaults if d not in allowed_ids]
        if missing:
            raise RagAccessError(f"default dataset_ids not allowed: {missing}")
        return list(defaults)
    raise RagAccessError("dataset_ids required")
