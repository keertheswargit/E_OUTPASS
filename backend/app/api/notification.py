from fastapi import APIRouter

from backend.app.repositories.notification_repository import NotificationRepository
from backend.app.services.notification_service import NotificationService

router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"]
)


@router.get("/{student_id}")
def get_notifications(student_id: str):
    repository = NotificationRepository()
    service = NotificationService(repository)

    return service.get_student_notifications(student_id)