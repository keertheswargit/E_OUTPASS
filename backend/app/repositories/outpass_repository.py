from datetime import datetime
from bson import ObjectId
from backend.app.db.mongodb import outpasses_collection


class OutpassRepository:

    def create(self, outpass_data: dict):
        result = outpasses_collection.insert_one(outpass_data)
        outpass_data["_id"] = result.inserted_id
        return outpass_data

    def get_by_student(self, student_id: str):
        return list(
            outpasses_collection.find(
                {"student_id": student_id}
            ).sort("request_timestamp", -1)
        )

    def get_by_id(self, outpass_id: str):
        try:
            return outpasses_collection.find_one(
                {"_id": ObjectId(outpass_id)}
            )
        except Exception:
            return outpasses_collection.find_one(
                {"_id": outpass_id}
            )

    def get_all_pending(self):
        return list(
            outpasses_collection.find(
                {"status": "PENDING"}
            ).sort("request_timestamp", -1)
        )

    def get_by_qr_token(self, qr_token: str):
        return outpasses_collection.find_one(
            {"qr_code_token": qr_token}
        )

    def update_status(
        self,
        outpass_id: str,
        status: str,
        warden_remarks: str = None,
        qr_code_token: str = None,
        qr_generated_at: datetime = None
    ):
        update_doc = {
            "status": status,
            "warden_remarks": warden_remarks,
            "decision_timestamp": datetime.utcnow()
        }

        if qr_code_token:
            update_doc["qr_code_token"] = qr_code_token
            update_doc["qr_is_used"] = False
            update_doc["qr_generated_at"] = qr_generated_at or datetime.utcnow()

        try:
            query = {"_id": ObjectId(outpass_id)}
        except Exception:
            query = {"_id": outpass_id}

        result = outpasses_collection.update_one(
            query,
            {"$set": update_doc}
        )

        return result.modified_count > 0

    def mark_qr_used(self, outpass_id: str):
        try:
            query = {"_id": ObjectId(outpass_id)}
        except Exception:
            query = {"_id": outpass_id}

        result = outpasses_collection.update_one(
            query,
            {"$set": {"qr_is_used": True}}
        )

        return result.modified_count > 0