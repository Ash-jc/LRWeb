import uuid

import pytest


async def make_project(client, headers, name="Paper Project"):
    resp = await client.post("/projects", json={"name": name}, headers=headers)
    assert resp.status_code == 201
    return resp.json()


PAPER_PAYLOAD = {
    "title": "Attention Is All You Need",
    "authors": ["Vaswani et al."],
    "year": 2017,
    "arxiv_id": "1706.03762",
    "abstract": "We propose the Transformer architecture.",
}


@pytest.mark.asyncio
async def test_add_paper(client, auth_headers):
    project = await make_project(client, auth_headers)
    pid = project["id"]

    resp = await client.post(f"/projects/{pid}/papers", json=PAPER_PAYLOAD, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["paper"]["title"] == "Attention Is All You Need"
    assert data["project_id"] == pid


@pytest.mark.asyncio
async def test_list_papers_empty(client, auth_headers):
    project = await make_project(client, auth_headers)
    pid = project["id"]

    resp = await client.get(f"/projects/{pid}/papers", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_list_papers(client, auth_headers):
    project = await make_project(client, auth_headers)
    pid = project["id"]

    p1 = {**PAPER_PAYLOAD, "arxiv_id": "1111.0001", "title": "Paper One"}
    p2 = {**PAPER_PAYLOAD, "arxiv_id": "2222.0002", "title": "Paper Two"}
    await client.post(f"/projects/{pid}/papers", json=p1, headers=auth_headers)
    await client.post(f"/projects/{pid}/papers", json=p2, headers=auth_headers)

    resp = await client.get(f"/projects/{pid}/papers", headers=auth_headers)
    assert resp.status_code == 200
    titles = [pp["paper"]["title"] for pp in resp.json()]
    assert "Paper One" in titles
    assert "Paper Two" in titles


@pytest.mark.asyncio
async def test_add_duplicate_paper_to_same_project(client, auth_headers):
    project = await make_project(client, auth_headers)
    pid = project["id"]

    await client.post(f"/projects/{pid}/papers", json=PAPER_PAYLOAD, headers=auth_headers)
    resp = await client.post(f"/projects/{pid}/papers", json=PAPER_PAYLOAD, headers=auth_headers)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_same_paper_in_two_projects(client, auth_headers):
    """Same canonical paper can appear in multiple projects."""
    p1 = await make_project(client, auth_headers, "P1")
    p2 = await make_project(client, auth_headers, "P2")

    r1 = await client.post(f"/projects/{p1['id']}/papers", json=PAPER_PAYLOAD, headers=auth_headers)
    r2 = await client.post(f"/projects/{p2['id']}/papers", json=PAPER_PAYLOAD, headers=auth_headers)

    assert r1.status_code == 201
    assert r2.status_code == 201
    # Both link to the same canonical paper_id
    assert r1.json()["paper_id"] == r2.json()["paper_id"]


@pytest.mark.asyncio
async def test_get_paper(client, auth_headers):
    project = await make_project(client, auth_headers)
    pid = project["id"]

    add = await client.post(f"/projects/{pid}/papers", json=PAPER_PAYLOAD, headers=auth_headers)
    paper_id = add.json()["paper_id"]

    resp = await client.get(f"/projects/{pid}/papers/{paper_id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["paper"]["title"] == "Attention Is All You Need"


@pytest.mark.asyncio
async def test_get_paper_404(client, auth_headers):
    project = await make_project(client, auth_headers)
    pid = project["id"]

    resp = await client.get(f"/projects/{pid}/papers/{uuid.uuid4()}", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_papers_scoped_to_project(client, auth_headers):
    p1 = await make_project(client, auth_headers, "P1")
    p2 = await make_project(client, auth_headers, "P2")

    await client.post(f"/projects/{p1['id']}/papers", json=PAPER_PAYLOAD, headers=auth_headers)

    resp = await client.get(f"/projects/{p2['id']}/papers", headers=auth_headers)
    assert resp.json() == []
