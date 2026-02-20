from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.paper import Paper, ProjectPaper
from app.routers.projects import get_current_user_id
from app.routers.runs import get_owned_project
from app.schemas.paper import PaperCreate, ProjectPaperCreate, ProjectPaperRead

router = APIRouter()


@router.get("/{project_id}/papers", response_model=List[ProjectPaperRead])
async def list_papers(
    project_id: uuid.UUID,
    skip: int = 0,
    limit: int = 50,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> List[ProjectPaper]:
    await get_owned_project(project_id, user_id, db)
    result = await db.execute(
        select(ProjectPaper)
        .where(ProjectPaper.project_id == project_id)
        .options(selectinload(ProjectPaper.paper))
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


@router.post("/{project_id}/papers", response_model=ProjectPaperRead, status_code=201)
async def add_paper(
    project_id: uuid.UUID,
    body: PaperCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ProjectPaper:
    await get_owned_project(project_id, user_id, db)

    # Find or create paper by DOI or arxiv_id
    paper: Optional[Paper] = None
    if body.doi:
        result = await db.execute(select(Paper).where(Paper.doi == body.doi))
        paper = result.scalar_one_or_none()
    if paper is None and body.arxiv_id:
        result = await db.execute(select(Paper).where(Paper.arxiv_id == body.arxiv_id))
        paper = result.scalar_one_or_none()
    if paper is None:
        paper = Paper(
            doi=body.doi,
            arxiv_id=body.arxiv_id,
            title=body.title,
            authors=body.authors,
            year=body.year,
            abstract=body.abstract,
            created_at=datetime.utcnow(),
        )
        db.add(paper)
        await db.flush()

    # Check if already linked to this project
    result = await db.execute(
        select(ProjectPaper).where(
            ProjectPaper.project_id == project_id, ProjectPaper.paper_id == paper.id
        )
    )
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Paper already in project")

    pp = ProjectPaper(
        project_id=project_id,
        paper_id=paper.id,
        added_at=datetime.utcnow(),
    )
    db.add(pp)
    await db.flush()
    await db.refresh(pp)

    # Eagerly load paper for response
    result = await db.execute(
        select(ProjectPaper)
        .where(ProjectPaper.id == pp.id)
        .options(selectinload(ProjectPaper.paper))
    )
    return result.scalar_one()


@router.post(
    "/{project_id}/papers/link",
    response_model=ProjectPaperRead,
    status_code=201,
)
async def link_paper(
    project_id: uuid.UUID,
    body: ProjectPaperCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ProjectPaper:
    await get_owned_project(project_id, user_id, db)

    # Verify paper exists
    result = await db.execute(select(Paper).where(Paper.id == body.paper_id))
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Paper not found")

    # Check if already linked
    result = await db.execute(
        select(ProjectPaper).where(
            ProjectPaper.project_id == project_id, ProjectPaper.paper_id == body.paper_id
        )
    )
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Paper already in project")

    pp = ProjectPaper(
        project_id=project_id,
        paper_id=body.paper_id,
        inclusion_reason=body.inclusion_reason,
        score=body.score,
        added_at=datetime.utcnow(),
    )
    db.add(pp)
    await db.flush()

    result = await db.execute(
        select(ProjectPaper)
        .where(ProjectPaper.id == pp.id)
        .options(selectinload(ProjectPaper.paper))
    )
    return result.scalar_one()


@router.get("/{project_id}/papers/{paper_id}", response_model=ProjectPaperRead)
async def get_paper(
    project_id: uuid.UUID,
    paper_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ProjectPaper:
    await get_owned_project(project_id, user_id, db)
    result = await db.execute(
        select(ProjectPaper)
        .where(ProjectPaper.project_id == project_id, ProjectPaper.paper_id == paper_id)
        .options(selectinload(ProjectPaper.paper))
    )
    pp = result.scalar_one_or_none()
    if pp is None:
        raise HTTPException(status_code=404, detail="Paper not in project")
    return pp
