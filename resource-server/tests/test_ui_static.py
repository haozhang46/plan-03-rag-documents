from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_ui_index_available():
    response = client.get("/ui/")
    assert response.status_code == 200
    assert "Topology Panel" in response.text
