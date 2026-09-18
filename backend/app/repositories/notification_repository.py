from datetime import datetime, timezone
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
                "student_id": str(model.student_id),
                "message": model.message,
                "outpass_id": str(model.outpass_id),
                "notification_type": model.notification_type,
                "is_read": getattr(model, "is_read", False),
                "created_at": getattr(model, "created_at", None) or datetime.now(timezone.utc)
            }
        else:
            notification = {
                "student_id": str(student_id_or_model),
                "message": message,
                "outpass_id": str(outpass_id) if outpass_id else None,
                "notification_type": notification_type,
                "is_read": False,
                "created_at": datetime.now(timezone.utc)
            }

        result = notifications_collection.insert_one(notification)
        notification["_id"] = str(result.inserted_id)

        return notification

    def get_student_notifications(self, student_id: str):
        items = list(
            notifications_collection.find(
                {"student_id": str(student_id)}
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
            res = notifications_collection.update_one(query, {"$set": {"is_read": True}})
            if res.modified_count == 0:
                res = notifications_collection.update_one(
                    {"_id": str(notification_id)},
                    {"$set": {"is_read": True}}
                )
            return res
        except Exception:
            return notifications_collection.update_one(
                {"_id": str(notification_id)},
                {"$set": {"is_read": True}}
            )

    def mark_all_as_read(self, student_id: str):
        notifications_collection.update_one(
            {"student_id": str(student_id)},
            {"$set": {"is_read": True}}
        )