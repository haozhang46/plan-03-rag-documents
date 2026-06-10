def test_admin_upsert_binding_requires_admin_key(client, monkeypatch):
    monkeypatch.setenv("ADMIN_API_KEY", "admin-secret")
    from app.config import get_settings

    get_settings.cache_clear()
    resp = client.put(
        "/v1/admin/ragflow/bindings/tenant-a",
        json={"api_key": "rk-test12", "default_dataset_ids": ["ds-1"]},
    )
    assert resp.status_code == 403
    get_settings.cache_clear()


def test_admin_upsert_binding_success(client, monkeypatch, test_app):
    monkeypatch.setenv("ADMIN_API_KEY", "admin-secret")
    from app.config import get_settings

    get_settings.cache_clear()
    resp = client.put(
        "/v1/admin/ragflow/bindings/tenant-a",
        json={"api_key": "rk-test12", "default_dataset_ids": ["ds-1"]},
        headers={"X-Admin-Key": "admin-secret"},
    )
    assert resp.status_code == 200
    assert resp.json()["tenant_id"] == "tenant-a"
    assert resp.json()["api_key_hint"] == "rk-…t12"
    get_settings.cache_clear()
