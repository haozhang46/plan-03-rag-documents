def test_list_sessions_empty(client):
    assert client.get("/v1/sessions").json() == []


def test_create_and_list_session(client):
    created = client.post("/v1/sessions", json={"title": "My chat"}).json()
    assert created["title"] == "My chat"
    assert created["thread_id"]
    assert created["starred"] is False

    listed = client.get("/v1/sessions").json()
    assert len(listed) == 1
    assert listed[0]["id"] == created["id"]


def test_create_with_thread_id(client):
    created = client.post(
        "/v1/sessions",
        json={"title": "Bound", "thread_id": "custom-thread-1"},
    ).json()
    assert created["thread_id"] == "custom-thread-1"


def test_patch_session_star_and_title(client):
    created = client.post("/v1/sessions", json={}).json()
    session_id = created["id"]

    updated = client.patch(
        f"/v1/sessions/{session_id}",
        json={"starred": True, "title": "Starred chat"},
    ).json()
    assert updated["starred"] is True
    assert updated["title"] == "Starred chat"


def test_delete_session(client):
    created = client.post("/v1/sessions", json={}).json()
    session_id = created["id"]

    resp = client.delete(f"/v1/sessions/{session_id}")
    assert resp.status_code == 204
    assert client.get("/v1/sessions").json() == []


def test_delete_missing_session_returns_404(client):
    resp = client.delete("/v1/sessions/00000000-0000-0000-0000-000000000099")
    assert resp.status_code == 404
