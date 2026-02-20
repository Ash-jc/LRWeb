from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


class RunCreate(BaseModel):
    config_snapshot: Dict[str, Any] = {}


class RunRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    status: str
    config_snapshot: Dict[str, Any]
    created_at: datetime
    completed_at: Optional[datetime]
