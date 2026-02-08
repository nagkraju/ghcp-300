("""Tests for the Mergington High School FastAPI app.")

import uuid

import pytest
from httpx import AsyncClient

from src.app import app


@pytest.mark.asyncio
async def test_get_activities():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        r = await ac.get("/activities")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, dict)
        assert "Chess Club" in data


@pytest.mark.asyncio
async def test_signup_and_unregister_flow():
    activity = "Chess Club"
    email = f"test-{uuid.uuid4().hex}@example.com"

    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Sign up
        r = await ac.post(f"/activities/{activity}/signup?email={email}")
        assert r.status_code == 200
        data = r.json()
        assert "Signed up" in data.get("message", "")

        # Confirm participant present
        r2 = await ac.get("/activities")
        participants = r2.json()[activity]["participants"]
        assert email in participants

        # Unregister
        r3 = await ac.delete(f"/activities/{activity}/unregister?email={email}")
        assert r3.status_code == 200
        data3 = r3.json()
        assert "Unregistered" in data3.get("message", "")

        # Confirm participant removed
        r4 = await ac.get("/activities")
        participants_after = r4.json()[activity]["participants"]
        assert email not in participants_after
