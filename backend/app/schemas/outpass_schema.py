from datetime import datetime
from pydantic import BaseModel


class OutpassResponse(BaseModel):
    id: int
    student_id: str
    destination: str
    reason: str
    departure_datetime: datetime
    return_datetime: datetime
    parent_contact: str
    request_timestamp: datetime
    status: str
    warden_remarks: str | None
    decision_timestamp: datetime | None

    class Config:
        from_attributes = True