from fastapi import APIRouter, Header, HTTPException

from backend.app.repositories.outpass_repository import OutpassRepository
from backend.app.services.outpass_service import OutpassService
from backend.app.schemas.outpass_schema import (
    OutpassCreateRequest,
    OutpassResponse,
    StudentOutpassHistoryResponse
)


router = APIRouter(
    prefix="/api/outpasses",
    tags=["Outpasses"]
)


def get_repository():
    from backend.app.db.mongodb import outpasses_collection

    return OutpassRepository()


@router.post("", response_model=OutpassResponse, status_code=201)
def create_outpass(
    request: OutpassCreateRequest,
    authorization: str | None = Header(default=None)
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    repository = get_repository()
    service = OutpassService(repository)

    return service.create_outpass(request.model_dump())


@router.get("/my", response_model=StudentOutpassHistoryResponse)
def get_my_outpasses(
    student_id: str
):
    repository = get_repository()
    service = OutpassService(repository)

    current, history = service.get_student_outpasses(student_id)

    return {
        "student_id": student_id,
        "current": current,
        "history": history
    }