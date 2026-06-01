import io
import zipfile

import pytest
import yaml
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.routes import skills
from app.config import get_settings
from app.skills.registry import SkillRegistry


@pytest.fixture
def skills_client(monkeypatch, skills_fixture):
    monkeypatch.setenv("ADMIN_API_KEY", "test-admin-key")
    get_settings.cache_clear()

    app = FastAPI()
    app.include_router(skills.router)

    with TestClient(app) as client:
        yield client

    get_settings.cache_clear()


@pytest.fixture
def tenant_skills_client(monkeypatch, skills_fixture):
    monkeypatch.setenv("TENANT_MODE", "true")
    monkeypatch.setenv("ADMIN_API_KEY", "test-admin-key")
    get_settings.cache_clear()

    app = FastAPI()
    app.include_router(skills.router)

    with TestClient(app) as client:
        yield client

    get_settings.cache_clear()


def test_list_skills_returns_public_entries(skills_client, skills_fixture):
    resp = skills_client.get("/v1/skills")
    assert resp.status_code == 200
    names = {s["name"] for s in resp.json()["skills"]}
    assert "test-driven-development" in names
    assert all(s.get("visibility", "public") == "public" for s in resp.json()["skills"])


def test_list_skills_hides_other_tenant_private(skills_fixture):
    registry_path = skills_fixture / "registry.yaml"
    data = yaml.safe_load(registry_path.read_text(encoding="utf-8"))
    data["skills"].append(
        {
            "name": "tenant-b-secret",
            "description": "Private skill",
            "path": "tenant-b/secret/SKILL.md",
            "visibility": "private",
            "tenant_id": "tenant-b",
            "triggers": ["secret"],
        }
    )
    registry_path.write_text(yaml.safe_dump(data, sort_keys=False), encoding="utf-8")
    (skills_fixture / "tenant-b" / "secret").mkdir(parents=True)
    (skills_fixture / "tenant-b" / "secret" / "SKILL.md").write_text(
        "# Secret\n", encoding="utf-8"
    )

    app = FastAPI()
    app.include_router(skills.router)
    client = TestClient(app)

    resp = client.get("/v1/skills", headers={"X-Tenant-ID": "tenant-a"})
    assert resp.status_code == 200
    names = {s["name"] for s in resp.json()["skills"]}
    assert "tenant-b-secret" not in names


def test_list_skills_includes_own_private(tenant_skills_client, skills_fixture):
    registry_path = skills_fixture / "registry.yaml"
    data = yaml.safe_load(registry_path.read_text(encoding="utf-8"))
    data["skills"].append(
        {
            "name": "tenant-a-private",
            "description": "My private skill",
            "path": "tenant-a/private/SKILL.md",
            "visibility": "private",
            "tenant_id": "tenant-a",
            "triggers": ["mine"],
        }
    )
    registry_path.write_text(yaml.safe_dump(data, sort_keys=False), encoding="utf-8")

    resp = tenant_skills_client.get("/v1/skills", headers={"X-Tenant-ID": "tenant-a"})
    assert resp.status_code == 200
    names = {s["name"] for s in resp.json()["skills"]}
    assert "tenant-a-private" in names


def test_register_skill_requires_admin_or_tenant(skills_client):
    resp = skills_client.post(
        "/v1/skills",
        json={
            "name": "new-skill",
            "description": "A new skill",
            "path": "new-skill/SKILL.md",
            "visibility": "public",
            "triggers": ["new"],
        },
    )
    assert resp.status_code == 403


def test_register_skill_with_admin_key(skills_client, skills_fixture):
    (skills_fixture / "new-skill").mkdir()
    (skills_fixture / "new-skill" / "SKILL.md").write_text("# New\n", encoding="utf-8")

    resp = skills_client.post(
        "/v1/skills",
        headers={"X-Admin-Key": "test-admin-key"},
        json={
            "name": "new-skill",
            "description": "A new skill",
            "path": "new-skill/SKILL.md",
            "visibility": "public",
            "triggers": ["new"],
        },
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "new-skill"

    reg = SkillRegistry(root=skills_fixture)
    assert any(s.name == "new-skill" for s in reg.list_l1())


def test_tenant_owner_can_register_private_skill(tenant_skills_client, skills_fixture):
    (skills_fixture / "tenant-a" / "owned").mkdir(parents=True)
    (skills_fixture / "tenant-a" / "owned" / "SKILL.md").write_text("# Owned\n", encoding="utf-8")

    resp = tenant_skills_client.post(
        "/v1/skills",
        headers={"X-Tenant-ID": "tenant-a"},
        json={
            "name": "owned-skill",
            "description": "Tenant private skill",
            "path": "tenant-a/owned/SKILL.md",
            "visibility": "private",
            "triggers": ["owned"],
        },
    )
    assert resp.status_code == 200
    assert resp.json()["tenant_id"] == "tenant-a"


def test_import_zip_requires_admin_or_tenant(tenant_skills_client):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("imported-skill/SKILL.md", "# Imported\n")
    buf.seek(0)

    resp = tenant_skills_client.post(
        "/v1/skills/import",
        files={"file": ("skills.zip", buf.getvalue(), "application/zip")},
    )
    assert resp.status_code == 401


def test_import_zip_extracts_and_registers(tenant_skills_client, skills_fixture):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("imported-skill/SKILL.md", "# Imported skill\n")
    buf.seek(0)

    resp = tenant_skills_client.post(
        "/v1/skills/import",
        headers={"X-Tenant-ID": "tenant-a"},
        files={"file": ("skills.zip", buf.getvalue(), "application/zip")},
    )
    assert resp.status_code == 200
    imported = resp.json()["skills"]
    assert len(imported) == 1
    assert imported[0]["name"] == "imported-skill"
    assert (skills_fixture / "tenant-a" / "imported-skill" / "SKILL.md").is_file()


def test_import_zip_rejects_missing_skill_md(tenant_skills_client):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("bad-skill/README.md", "no skill file")
    buf.seek(0)

    resp = tenant_skills_client.post(
        "/v1/skills/import",
        headers={"X-Tenant-ID": "tenant-a"},
        files={"file": ("skills.zip", buf.getvalue(), "application/zip")},
    )
    assert resp.status_code == 400
