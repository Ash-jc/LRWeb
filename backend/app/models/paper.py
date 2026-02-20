from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.types import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.project import Project


class Paper(Base):
    __tablename__ = "papers"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    doi: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    arxiv_id: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    authors: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    abstract: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    project_papers: Mapped[List[ProjectPaper]] = relationship(back_populates="paper")


class ProjectPaper(Base):
    __tablename__ = "project_papers"
    __table_args__ = (UniqueConstraint("project_id", "paper_id", name="uq_project_paper"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    paper_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("papers.id", ondelete="CASCADE"), nullable=False
    )
    inclusion_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    project: Mapped[Project] = relationship(back_populates="project_papers")
    paper: Mapped[Paper] = relationship(back_populates="project_papers")
