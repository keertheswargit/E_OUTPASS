from backend.app.models.notification import Notification


class NotificationService:

    def __init__(self, repository):
        self.repository = repository

    def notify_approved(self, student_id, outpass_id):
        notification = Notification(
            student_id=student_id,
            outpass_id=str(outpass_id),
            message="Your outpass request has been approved.",
            notification_type="OUTPASS_APPROVED"
        )

        return self.repository.create(notification)

    def notify_rejected(self, student_id, outpass_id):
        notification = Notification(
            student_id=student_id,
            outpass_id=str(outpass_id),
            message="Your outpass request has been rejected.",
            notification_type="OUTPASS_REJECTED"
        )

        return self.repository.create(notification)

    def get_student_notifications(self, student_id):
        return self.repository.get_by_student(student_id)
    

    