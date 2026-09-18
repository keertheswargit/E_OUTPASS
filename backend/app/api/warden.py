from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.repositories.outpass_repository import OutpassRepository
from backend.app.repositories.notification_repository import NotificationRepository
from backend.app.services.notification_service import NotificationService
from backend.app.services.warden_service import WardenService


router = APIRouter(
    prefix="/api/warden",
    tags=["Warden"]
)


class WardenDecision(BaseModel):
    warden_remarks: Optional[str] = None


def get_warden_service():
    outpass_repository = OutpassRepository()
    notification_repository = NotificationRepository()
    notification_service = NotificationService(notification_repository)
    return WardenService(outpass_repository, notification_service)


@router.get("/outpasses/pending")
def get_pending_outpasses():
    service = get_warden_service()
    return service.get_pending_outpasses()


@router.post("/outpasses/{outpass_id}/approve")
def approve_outpass(
    outpass_id: str,
    decision: Optional[WardenDecision] = None
):
    try:
        service = get_warden_service()
        remarks = decision.warden_remarks if decision else None

        return service.approve_outpass(
            outpass_id,
            remarks
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.post("/outpasses/{outpass_id}/reject")
def reject_outpass(
    outpass_id: str,
    decision: Optional[WardenDecision] = None
):
    try:
        service = get_warden_service()
        remarks = decision.warden_remarks if decision else None

        return service.reject_outpass(
            outpass_id,
            remarks
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )