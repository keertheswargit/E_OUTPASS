from fastapi import APIRouter, HTTPException

from backend.app.repositories.outpass_repository import OutpassRepository
from backend.app.services.outpass_service import OutpassService


router = APIRouter(
    prefix="/api/outpasses",
    tags=["Outpasses"]
)


@router.get("/pending")
def get_pending_outpasses():
    repository = OutpassRepository()
    service = OutpassService(repository)

    return service.get_pending_outpasses()


@router.put("/{outpass_id}/approve")
def approve_outpass(outpass_id: str):
    repository = OutpassRepository()
    service = OutpassService(repository)

    result = service.approve_outpass(outpass_id)

    if result.modified_count == 0:
        raise HTTPException(
            status_code=400,
            detail="Outpass is not pending or does not exist"
        )

    return {"message": "Outpass approved successfully"}


@router.put("/{outpass_id}/reject")
def reject_outpass(outpass_id: str):
    repository = OutpassRepository()
    service = OutpassService(repository)

    result = service.reject_outpass(outpass_id)

    if result.modified_count == 0:
        raise HTTPException(
            status_code=400,
            detail="Outpass is not pending or does not exist"
        )

    return {"message": "Outpass rejected successfully"}