import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.outpass import OutpassStatus


class OutpassDecisionRequest(BaseModel):
    decision: OutpassStatus  # must be Approved or Rejected (validated in route)
    remarks: Optional[str] = None


class OutpassStatusHistoryOut(BaseModel):
    id: uuid.UUID
    status: OutpassStatus
    changed_by_warden_id: uuid.UUID
    remarks: Optional[str]
    changed_at: datetime

    class Config:
        from_attributes = True  # pydantic v2; use orm_mode=True for v1


class OutpassRequestOut(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    status: OutpassStatus
    updated_at: datetime
    history: list[OutpassStatusHistoryOut] = []

    class Config:
        from_attributes = True
