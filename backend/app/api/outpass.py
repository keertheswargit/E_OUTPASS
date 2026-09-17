from fastapi import APIRouter, HTTPException
from backend.app.repositories.outpass_repository import OutpassRepository
from backend.app.services.outpass_service import OutpassService
from backend.app.schemas.outpass_schema import (
    StudentOutpassHistoryResponse,
    OutpassCreateRequest,
    OutpassResponse
)


router = APIRouter(
    prefix="/api/outpasses",
    tags=["Outpasses"]
)


def get_outpass_service():
    repository = OutpassRepository()
    return OutpassService(repository)


@router.post("/submit", response_model=OutpassResponse)
@router.post("/", response_model=OutpassResponse)
def submit_outpass(request: OutpassCreateRequest):
    try:
        service = get_outpass_service()
        created = service.create_outpass(
            student_id=request.student_id,
            destination=request.destination,
            reason=request.reason,
            departure_datetime=request.departure_datetime,
            return_datetime=request.return_datetime,
            parent_contact=request.parent_contact
        )
        return created
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/my", response_model=StudentOutpassHistoryResponse)
def get_my_outpasses(student_id: str):
    service = get_outpass_service()
    current, history = service.get_student_outpasses(student_id)

    return {
        "student_id": student_id,
        "current": current,
        "history": history
    }