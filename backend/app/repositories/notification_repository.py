from datetime import datetime
from bson import ObjectId
from backend.app.db.mongodb import notifications_collection


class NotificationRepository:

    def create(
        self,
        student_id_or_model,
        message: str = None,
        outpass_id: str = None,
        notification_type: str = "OUTPASS_STATUS"
    ):
        if hasattr(student_id_or_model, "student_id"):
            model = student_id_or_model
            notification = {
                "student_id": model.student_id,
                "message": model.message,
                "outpass_id": str(model.outpass_id),
                "notification_type": model.notification_type,
                "is_read": getattr(model, "is_read", False),
                "created_at": getattr(model, "created_at", None) or datetime.utcnow()
            }
        else:
            notification = {
                "student_id": student_id_or_model,
                "message": message,
                "outpass_id": str(outpass_id),
                "notification_type": notification_type,
                "is_read": False,
                "created_at": datetime.utcnow()
            }

        result = notifications_collection.insert_one(notification)
        notification["_id"] = str(result.inserted_id)

        return notification

    def get_student_notifications(self, student_id: str):
        items = list(
            notifications_collection.find(
                {"student_id": student_id}
            ).sort("created_at", -1)
        )
        for item in items:
            item["_id"] = str(item["_id"])
        return items

    def get_by_student(self, student_id: str):
        return self.get_student_notifications(student_id)

    def mark_as_read(self, notification_id: str):
        try:
            query = {"_id": ObjectId(notification_id)}
        except Exception:
            query = {"_id": notification_id}

        return notifications_collection.update_one(
            query,
            {"$set": {"is_read": True}}
        )