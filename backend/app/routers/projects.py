from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate

router = APIRouter()

# Stub auth: caller passes X-User-Id header. Real auth is Phase 2.
async def get_current_user_id(x_user_id: Optional[str] = Header(default=None)) -> uuid.UUID:
    if not x_user_id:
        raise HTTPException(status_code=401, detail="X-User-Id header required")
    try:
        return uuid.UUID(x_user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid X-User-Id")


async def ensure_user_exists(user_id: uuid.UUID, db: AsyncSession) -> None:
    """Create a stub user record if it doesn't exist yet."""
    result = await db.execute(select(User).where(User.id == user_id))
    if result.scalar_one_or_none() is None:
        db.add(User(id=user_id, email=f"{user_id}@stub.local", created_at=datetime.utcnow()))


@router.get("", response_model=List[ProjectRead])
async def list_projects(
    skip: int = 0,
    limit: int = 50,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> List[Project]:
    result = await db.execute(
        select(Project).where(Project.owner_id == user_id).offset(skip).limit(limit)
    )
    return list(result.scalars().all())


@router.post("", response_model=ProjectRead, status_code=201)
async def create_project(
    body: ProjectCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> Project:
    await ensure_user_exists(user_id, db)
    now = datetime.utcnow()
    project = Project(
        owner_id=user_id,
        name=body.name,
        description=body.description,
        created_at=now,
        updated_at=now,
    )
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(
    project_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> Project:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user_id)
    )
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectRead)
async def update_project(
    project_id: uuid.UUID,
    body: ProjectUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> Project:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user_id)
    )
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if body.name is not None:
        project.name = body.name
    if body.description is not None:
        project.description = body.description
    project.updated_at = datetime.utcnow()
    await db.flush()
    await db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user_id)
    )
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
