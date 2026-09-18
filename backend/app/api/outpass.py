from fastapi import APIRouter

from backend.app.repositories.outpass_repository import OutpassRepository
from backend.app.services.outpass_service import OutpassService
from backend.app.schemas.outpass_schema import StudentOutpassHistoryResponse


router = APIRouter(
    prefix="/api/outpasses",
    tags=["Outpasses"]
)


@router.get("/my", response_model=StudentOutpassHistoryResponse)
def get_my_outpasses(student_id: str):

    repository = OutpassRepository()
    service = OutpassService(repository)

    current, history = service.get_student_outpasses(student_id)

    return {
        "student_id": student_id,
        "current": current,
        "history": history
    }