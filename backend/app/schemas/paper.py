from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class PaperCreate(BaseModel):
    doi: Optional[str] = None
    arxiv_id: Optional[str] = None
    title: str
    authors: List[str] = []
    year: Optional[int] = None
    abstract: Optional[str] = None


class PaperRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    doi: Optional[str]
    arxiv_id: Optional[str]
    title: str
    authors: List[str]
    year: Optional[int]
    abstract: Optional[str]
    created_at: datetime


class ProjectPaperCreate(BaseModel):
    paper_id: uuid.UUID
    inclusion_reason: Optional[str] = None
    score: Optional[float] = None


class ProjectPaperRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    paper_id: uuid.UUID
    inclusion_reason: Optional[str]
    score: Optional[float]
    added_at: datetime
    paper: PaperRead
