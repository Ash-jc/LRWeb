import uuid

import pytest


async def make_project(client, headers, name="Test Project"):
    resp = await client.post("/projects", json={"name": name}, headers=headers)
    assert resp.status_code == 201
    return resp.json()


@pytest.mark.asyncio
async def test_create_run_empty_snapshot(client, auth_headers):
    project = await make_project(client, auth_headers)
    pid = project["id"]

    resp = await client.post(f"/projects/{pid}/runs", json={}, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["project_id"] == pid
    assert data["status"] == "pending"
    assert data["config_snapshot"] == {}
    assert data["completed_at"] is None


@pytest.mark.asyncio
async def test_create_run_with_snapshot(client, auth_headers):
    project = await make_project(client, auth_headers)
    pid = project["id"]

    snapshot = {
        "model": "gpt-4o",
        "prompt_version": "v1",
        "clustering_params": {"n_clusters": 10},
        "privacy_mode": "metadata-only",
    }
    resp = await client.post(
        f"/projects/{pid}/runs",
        json={"config_snapshot": snapshot},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["config_snapshot"] == snapshot


@pytest.mark.asyncio
async def test_config_snapshot_is_immutable(client, auth_headers):
    """The API must not expose any endpoint that modifies config_snapshot."""
    project = await make_project(client, auth_headers)
    pid = project["id"]
    run_resp = await client.post(
        f"/projects/{pid}/runs",
        json={"config_snapshot": {"model": "gpt-4o"}},
        headers=auth_headers,
    )
    run_id = run_resp.json()["id"]

    # There is no PATCH /runs endpoint — confirm 405 or 404
    resp = await client.patch(
        f"/projects/{pid}/runs/{run_id}",
        json={"config_snapshot": {"model": "hacked"}},
        headers=auth_headers,
    )
    assert resp.status_code in (404, 405)

    # Re-fetch and confirm snapshot unchanged
    get_resp = await client.get(f"/projects/{pid}/runs/{run_id}", headers=auth_headers)
    assert get_resp.json()["config_snapshot"] == {"model": "gpt-4o"}


@pytest.mark.asyncio
async def test_list_runs(client, auth_headers):
    project = await make_project(client, auth_headers)
    pid = project["id"]

    await client.post(f"/projects/{pid}/runs", json={}, headers=auth_headers)
    await client.post(f"/projects/{pid}/runs", json={}, headers=auth_headers)

    resp = await client.get(f"/projects/{pid}/runs", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 2


@pytest.mark.asyncio
async def test_get_run_404(client, auth_headers):
    project = await make_project(client, auth_headers)
    pid = project["id"]

    resp = await client.get(f"/projects/{pid}/runs/{uuid.uuid4()}", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_runs_scoped_to_project(client, auth_headers):
    p1 = await make_project(client, auth_headers, "P1")
    p2 = await make_project(client, auth_headers, "P2")

    await client.post(f"/projects/{p1['id']}/runs", json={}, headers=auth_headers)

    resp = await client.get(f"/projects/{p2['id']}/runs", headers=auth_headers)
    assert resp.json() == []


@pytest.mark.asyncio
async def test_runs_require_project_ownership(client, auth_headers):
    project = await make_project(client, auth_headers)
    pid = project["id"]

    other_headers = {"X-User-Id": str(uuid.uuid4())}
    resp = await client.get(f"/projects/{pid}/runs", headers=other_headers)
    assert resp.status_code == 404
