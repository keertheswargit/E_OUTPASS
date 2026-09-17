from datetime import datetime
from pydantic import BaseModel


class OutpassCreateRequest(BaseModel):
    student_id: str
    destination: str
    reason: str
    departure_datetime: datetime
    return_datetime: datetime
    parent_contact: str


class OutpassResponse(BaseModel):
    id: str
    student_id: str
    destination: str
    reason: str
    departure_datetime: datetime
    return_datetime: datetime
    parent_contact: str
    request_timestamp: datetime
    status: str
    warden_remarks: str | None = None
    decision_timestamp: datetime | None = None


class StudentOutpassHistoryResponse(BaseModel):
    student_id: str
    current: OutpassResponse | None
    history: list[OutpassResponse]