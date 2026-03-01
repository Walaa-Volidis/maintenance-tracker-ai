"""Unit tests for the Maintenance Request Tracker API endpoints."""

from fastapi.testclient import TestClient

# ── Sample payloads ────────────────────────────────────────────────

SAMPLE_REQUEST = {
    "title": "Broken faucet in Room 204",
    "description": "The kitchen faucet has been dripping all day.",
    "priority": "Low",
    "status": "Pending",
}

HIGH_PRIORITY_REQUEST = {
    "title": "Electrical panel sparking",
    "description": "Main panel is arcing and smells like burning.",
    "priority": "High",
    "status": "Pending",
}


# ── POST /api/requests ────────────────────────────────────────────

class TestCreateRequest:
    """Tests for the create-request endpoint."""

    def test_create_request_returns_201(self, client: TestClient):
        response = client.post("/api/requests", json=SAMPLE_REQUEST)
        assert response.status_code == 201

    def test_create_request_body(self, client: TestClient):
        response = client.post("/api/requests", json=SAMPLE_REQUEST)
        data = response.json()

        assert data["title"] == SAMPLE_REQUEST["title"]
        assert data["description"] == SAMPLE_REQUEST["description"]
        assert data["priority"] == "Low"
        assert data["status"] == "Pending"
        assert data["id"] is not None
        assert data["created_at"] is not None

    def test_create_request_has_ai_fields(self, client: TestClient):
        """AI category and summary should be populated by the mocked AI."""
        response = client.post("/api/requests", json=SAMPLE_REQUEST)
        data = response.json()

        # These values come from the mocks defined in conftest.py
        assert data["category"] == "Plumbing"
        assert data["ai_summary"] == "Leaking pipe in kitchen"

    def test_create_request_validation_error(self, client: TestClient):
        """Missing required fields should return 422."""
        response = client.post("/api/requests", json={})
        assert response.status_code == 422


# ── GET /api/requests ──────────────────────────────────────────────

class TestGetAllRequests:
    """Tests for the list-requests endpoint (paginated)."""

    def test_get_requests_empty(self, client: TestClient):
        response = client.get("/api/requests")
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0
        assert data["page"] == 1
        assert data["pages"] == 1

    def test_get_requests_returns_paginated(self, client: TestClient):
        # Seed two records
        client.post("/api/requests", json=SAMPLE_REQUEST)
        client.post("/api/requests", json=HIGH_PRIORITY_REQUEST)

        response = client.get("/api/requests", params={"skip": 0, "limit": 5})
        data = response.json()

        assert response.status_code == 200
        assert isinstance(data["items"], list)
        assert len(data["items"]) == 2
        assert data["total"] == 2
        assert data["page"] == 1
        assert data["pages"] == 1

    def test_get_requests_newest_first(self, client: TestClient):
        client.post("/api/requests", json=SAMPLE_REQUEST)
        client.post("/api/requests", json=HIGH_PRIORITY_REQUEST)

        data = client.get("/api/requests").json()

        # Second record was created later → should be first in the list
        assert data["items"][0]["title"] == HIGH_PRIORITY_REQUEST["title"]
        assert data["items"][1]["title"] == SAMPLE_REQUEST["title"]

    def test_pagination_limit(self, client: TestClient):
        """When limit=1, only one item should be returned per page."""
        client.post("/api/requests", json=SAMPLE_REQUEST)
        client.post("/api/requests", json=HIGH_PRIORITY_REQUEST)

        data = client.get("/api/requests", params={"skip": 0, "limit": 1}).json()
        assert len(data["items"]) == 1
        assert data["total"] == 2
        assert data["pages"] == 2

    def test_pagination_skip(self, client: TestClient):
        """Skipping records should return the correct page."""
        client.post("/api/requests", json=SAMPLE_REQUEST)
        client.post("/api/requests", json=HIGH_PRIORITY_REQUEST)

        data = client.get("/api/requests", params={"skip": 1, "limit": 1}).json()
        assert len(data["items"]) == 1
        assert data["page"] == 2


# ── GET /api/analytics/stats ──────────────────────────────────────

class TestAnalytics:
    """Tests for the analytics/stats endpoint."""

    def test_analytics_empty_db(self, client: TestClient):
        response = client.get("/api/analytics/stats")
        assert response.status_code == 200

        data = response.json()
        assert data["total_requests"] == 0
        assert data["most_common_category"] is None
        assert data["high_priority_count"] == 0

    def test_analytics_total_requests(self, client: TestClient):
        client.post("/api/requests", json=SAMPLE_REQUEST)
        client.post("/api/requests", json=SAMPLE_REQUEST)
        client.post("/api/requests", json=HIGH_PRIORITY_REQUEST)

        data = client.get("/api/analytics/stats").json()
        assert data["total_requests"] == 3

    def test_analytics_high_priority_count(self, client: TestClient):
        client.post("/api/requests", json=SAMPLE_REQUEST)
        client.post("/api/requests", json=HIGH_PRIORITY_REQUEST)
        client.post("/api/requests", json=HIGH_PRIORITY_REQUEST)

        data = client.get("/api/analytics/stats").json()
        assert data["high_priority_count"] == 2

    def test_analytics_most_common_category(self, client: TestClient):
        """All mocked requests get category='Plumbing', so that should win."""
        client.post("/api/requests", json=SAMPLE_REQUEST)
        client.post("/api/requests", json=SAMPLE_REQUEST)

        data = client.get("/api/analytics/stats").json()
        assert data["most_common_category"] == "Plumbing"


# ── Root health check ─────────────────────────────────────────────

class TestRoot:
    def test_root_returns_message(self, client: TestClient):
        response = client.get("/")
        assert response.status_code == 200
        assert "MRT API" in response.json()["message"]
