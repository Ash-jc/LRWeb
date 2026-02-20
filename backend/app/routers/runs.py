from __future__ import annotations

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.project import Project
from app.models.run import Run
from app.routers.projects import get_current_user_id
from app.schemas.run import RunCreate, RunRead

router = APIRouter()


async def get_owned_project(
    project_id: uuid.UUID,
    user_id: uuid.UUID,
    db: AsyncSession,
) -> Project:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user_id)
    )
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/{project_id}/runs", response_model=List[RunRead])
async def list_runs(
    project_id: uuid.UUID,
    skip: int = 0,
    limit: int = 50,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> List[Run]:
    await get_owned_project(project_id, user_id, db)
    result = await db.execute(
        select(Run).where(Run.project_id == project_id).offset(skip).limit(limit)
    )
    return list(result.scalars().all())


@router.post("/{project_id}/runs", response_model=RunRead, status_code=201)
async def create_run(
    project_id: uuid.UUID,
    body: RunCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> Run:
    await get_owned_project(project_id, user_id, db)
    run = Run(project_id=project_id, config_snapshot=body.config_snapshot)
    db.add(run)
    await db.flush()
    await db.refresh(run)
    return run


@router.get("/{project_id}/runs/{run_id}", response_model=RunRead)
async def get_run(
    project_id: uuid.UUID,
    run_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> Run:
    await get_owned_project(project_id, user_id, db)
    result = await db.execute(
        select(Run).where(Run.id == run_id, Run.project_id == project_id)
    )
    run = result.scalar_one_or_none()
    if run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return run
