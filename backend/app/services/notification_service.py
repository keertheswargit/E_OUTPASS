from datetime import datetime
class NotificationService:

    def __init__(self, repository):
        self.repository = repository

    def get_student_notifications(self, student_id: str):
        notifications = self.repository.get_by_student(student_id)

        for notification in notifications:
            notification["_id"] = str(notification["_id"])

        return notifications

    def create_status_notification(self, student_id: str, status: str):
        message = f"Your outpass request has been {status.lower()}."

        notification = {
            "student_id": student_id,
            "message": message,
            "status": status,
            "read": False,
            "created_at": datetime.utcnow()
        }

        return self.repository.create(notification)