from fastapi.testclient import TestClient

from app.main import app


def test_beta_session_contract() -> None:
    client = TestClient(app)

    response = client.get("/api/v1/auth/session")

    assert response.status_code == 200
    payload = response.json()["data"]
    assert payload["authenticated"] is True
    assert payload["mode"] == "beta"
    assert payload["user"]["role"] == "nutritionist"
