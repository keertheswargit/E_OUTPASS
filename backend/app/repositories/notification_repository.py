from backend.app.db.mongodb import notifications_collection


class NotificationRepository:

    def get_by_student(self, student_id: str):
        return list(
            notifications_collection.find(
                {"student_id": student_id}
            ).sort("created_at", -1)
        )

    def create(self, notification):
        return notifications_collection.insert_one(notification)