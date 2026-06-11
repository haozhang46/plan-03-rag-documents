import pytest

from app.auth.passwords import hash_password
from app.auth.users_store import MemoryUsersStore


@pytest.mark.asyncio
async def test_create_and_get_by_email():
    store = MemoryUsersStore()
    user = await store.create(
        tenant_id="tenant-a",
        email="alice@example.com",
        password_hash=hash_password("secret"),
        display_name="Alice",
    )
    found = await store.get_by_email("alice@example.com")
    assert found is not None
    assert found.id == user.id
    assert found.tenant_id == "tenant-a"
