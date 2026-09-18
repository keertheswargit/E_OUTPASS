from fastapi import APIRouter, HTTPException
from backend.app.repositories.notification_repository import NotificationRepository
from backend.app.services.notification_service import NotificationService


router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"]
)


def get_notification_service():
    repository = NotificationRepository()
    return NotificationService(repository)


@router.get("/my")
def get_student_notifications(student_id: str):
    service = get_notification_service()
    return service.get_student_notifications(student_id)


@router.put("/{notification_id}/read")
def mark_notification_read(notification_id: str):
    repository = NotificationRepository()
    result = repository.mark_as_read(notification_id)
    return {"success": result.modified_count > 0}


@router.put("/my/read-all")
def mark_all_notifications_read(student_id: str):
    repository = NotificationRepository()
    repository.mark_all_as_read(student_id)
    return {"success": True}