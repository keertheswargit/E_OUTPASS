from datetime import datetime
<<<<<<< HEAD
from typing import Any, Optional
from pydantic import BaseModel, Field


class OutpassSubmitRequest(BaseModel):
=======
from pydantic import BaseModel


class OutpassCreateRequest(BaseModel):
>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
    student_id: str
    destination: str
    reason: str
    departure_datetime: datetime
    return_datetime: datetime
    parent_contact: str
<<<<<<< HEAD
    emergency_contact: Optional[str] = None


class OutpassResponse(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
=======


class OutpassResponse(BaseModel):
    id: str
>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
    student_id: str
    destination: str
    reason: str
    departure_datetime: datetime
    return_datetime: datetime
    parent_contact: str
<<<<<<< HEAD
    emergency_contact: Optional[str] = None
    request_timestamp: Optional[datetime] = None
    status: str
    warden_remarks: Optional[str] = None
    decision_timestamp: Optional[datetime] = None
    qr_code_token: Optional[str] = None
    qr_generated_at: Optional[datetime] = None
    qr_is_used: Optional[bool] = False

    class Config:
        populate_by_name = True
        extra = "allow"
=======
    request_timestamp: datetime
    status: str
    warden_remarks: str | None = None
    decision_timestamp: datetime | None = None
>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17


class StudentOutpassHistoryResponse(BaseModel):
    student_id: str
<<<<<<< HEAD
    current: Optional[dict[str, Any]] = None
    history: list[dict[str, Any]] = []


class GateVerifyRequest(BaseModel):
    qr_token: str


class GateVerifyResponse(BaseModel):
    valid: bool
    message: str
    outpass: Optional[dict[str, Any]] = None


class NotificationResponse(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    student_id: str
    outpass_id: str
    message: str
    notification_type: str
    is_read: bool = False
    created_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        extra = "allow"
=======
    current: OutpassResponse | None
    history: list[OutpassResponse]
>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
