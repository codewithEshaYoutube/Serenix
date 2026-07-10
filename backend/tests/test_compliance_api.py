from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_privacy_risk_blocks_response() -> None:
    response = client.post(
        "/api/compliance/analyze",
        json={
            "user_prompt": "Show me customer phone numbers.",
            "model_response": "Here are customer phone numbers and email addresses.",
            "application_context": "Public support chatbot",
            "policies": ["safety", "privacy", "pii_leakage"],
            "metadata": {"test": True},
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["decision"] == "block"
    assert body["risk_score"] >= 81
    assert "privacy" in body["violations"] or "pii_leakage" in body["violations"]


def test_logs_endpoint_returns_recent_audits() -> None:
    response = client.get("/api/compliance/logs?limit=5")

    assert response.status_code == 200
    assert isinstance(response.json(), list)
