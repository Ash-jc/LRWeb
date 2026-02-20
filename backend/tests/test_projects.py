import uuid

import pytest


@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_list_projects_empty(client, auth_headers):
    resp = await client.get("/projects", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_create_project(client, auth_headers):
    resp = await client.post(
        "/projects",
        json={"name": "My Lit Review", "description": "Test desc"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "My Lit Review"
    assert data["description"] == "Test desc"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


@pytest.mark.asyncio
async def test_create_project_no_auth(client):
    resp = await client.post("/projects", json={"name": "No Auth"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_list_projects_returns_own(client, auth_headers):
    await client.post("/projects", json={"name": "P1"}, headers=auth_headers)
    await client.post("/projects", json={"name": "P2"}, headers=auth_headers)

    other_headers = {"X-User-Id": str(uuid.uuid4())}
    await client.post("/projects", json={"name": "Other"}, headers=other_headers)

    resp = await client.get("/projects", headers=auth_headers)
    assert resp.status_code == 200
    names = [p["name"] for p in resp.json()]
    assert "P1" in names
    assert "P2" in names
    assert "Other" not in names


@pytest.mark.asyncio
async def test_get_project(client, auth_headers):
    create = await client.post("/projects", json={"name": "Detail"}, headers=auth_headers)
    project_id = create.json()["id"]

    resp = await client.get(f"/projects/{project_id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == project_id


@pytest.mark.asyncio
async def test_get_project_404(client, auth_headers):
    resp = await client.get(f"/projects/{uuid.uuid4()}", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_project(client, auth_headers):
    create = await client.post("/projects", json={"name": "Old Name"}, headers=auth_headers)
    project_id = create.json()["id"]

    resp = await client.patch(
        f"/projects/{project_id}",
        json={"name": "New Name"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "New Name"


@pytest.mark.asyncio
async def test_update_project_not_owner(client, auth_headers):
    create = await client.post("/projects", json={"name": "Mine"}, headers=auth_headers)
    project_id = create.json()["id"]

    other_headers = {"X-User-Id": str(uuid.uuid4())}
    resp = await client.patch(
        f"/projects/{project_id}", json={"name": "Hijack"}, headers=other_headers
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_project(client, auth_headers):
    create = await client.post("/projects", json={"name": "To Delete"}, headers=auth_headers)
    project_id = create.json()["id"]

    resp = await client.delete(f"/projects/{project_id}", headers=auth_headers)
    assert resp.status_code == 204

    resp = await client.get(f"/projects/{project_id}", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_pagination(client, auth_headers):
    for i in range(5):
        await client.post("/projects", json={"name": f"P{i}"}, headers=auth_headers)

    resp = await client.get("/projects?skip=0&limit=3", headers=auth_headers)
    assert len(resp.json()) == 3

    resp = await client.get("/projects?skip=3&limit=3", headers=auth_headers)
    assert len(resp.json()) == 2
