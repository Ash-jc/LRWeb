from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import papers, projects, runs

app = FastAPI(
    title="LRWeb API",
    description="Interactive Literature Review Platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(runs.router, prefix="/projects", tags=["runs"])
app.include_router(papers.router, prefix="/projects", tags=["papers"])


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
