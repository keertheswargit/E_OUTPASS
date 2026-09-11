from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.database import SessionLocal
from backend.app.schemas.outpass_schema import StudentOutpassHistoryResponse 
from backend.app.services.outpass_service import OutpassService
from backend.app.schemas.outpass_schema import OutpassResponse


router = APIRouter(
    prefix="/api/outpasses",
    tags=["Outpasses"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/my", response_model=StudentOutpassHistoryResponse)
def get_my_outpasses(
    student_id: str,
    db: Session = Depends(get_db)
):
    repository = OutpassRepository(db)
    service = OutpassService(repository)

    current, history = service.get_student_outpasses(student_id)

    return {
        "student_id": student_id,
        "current": current,
        "history": history
    }