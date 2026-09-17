from datetime import datetime
from pydantic import BaseModel, Field


class OutpassCreateRequest(BaseModel):
    student_id: str = "2024506050"
    destination: str
    reason: str
    departure_datetime: datetime
    return_datetime: datetime
    parent_contact: str


class OutpassResponse(BaseModel):
    id: str | None = Field(default=None, alias="_id")
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
    qr_code_token: str | None = None
    qr_is_used: bool | None = False
    qr_generated_at: datetime | None = None

    class Config:
        from_attributes = True
        populate_by_name = True


class StudentOutpassHistoryResponse(BaseModel):
    student_id: str
    current: OutpassResponse | None = None
    history: list[OutpassResponse] = []


class GateVerifyRequest(BaseModel):
    qr_token: str


class GateVerifyResponse(BaseModel):
    valid: bool
    message: str
    outpass: OutpassResponse | None = None