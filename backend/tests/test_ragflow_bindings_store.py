import pytest

from app.rag.bindings_store import MemoryRagflowBindingsStore


@pytest.mark.asyncio
async def test_upsert_and_get_tenant_level_binding():
    store = MemoryRagflowBindingsStore()
    await store.upsert(
        tenant_id="tenant-a",
        user_id=None,
        api_key="rk-tenant",
        default_dataset_ids=["ds-1"],
    )
    row = await store.get(tenant_id="tenant-a", user_id=None)
    assert row.api_key == "rk-tenant"
    assert row.default_dataset_ids == ["ds-1"]


@pytest.mark.asyncio
async def test_user_binding_overrides_tenant_default():
    store = MemoryRagflowBindingsStore()
    await store.upsert("tenant-a", None, "rk-tenant", ["ds-shared"])
    await store.upsert("tenant-a", "user-1", "rk-user", ["ds-private"])
    row = await store.get("tenant-a", "user-1")
    assert row.api_key == "rk-user"
    assert row.default_dataset_ids == ["ds-private"]
