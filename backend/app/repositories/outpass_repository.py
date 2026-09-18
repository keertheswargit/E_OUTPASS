<<<<<<< HEAD
from datetime import datetime, timezone
from bson import ObjectId
=======
>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
from backend.app.db.mongodb import outpasses_collection


class OutpassRepository:

<<<<<<< HEAD
    def __init__(self, db=None):
        self.collection = outpasses_collection

    def create(self, outpass_data):
        if hasattr(outpass_data, "__dict__"):
            doc = dict(outpass_data.__dict__)
        elif isinstance(outpass_data, dict):
            doc = dict(outpass_data)
        else:
            raise ValueError("Invalid outpass data format")

        if "request_timestamp" not in doc or doc["request_timestamp"] is None:
            doc["request_timestamp"] = datetime.now(timezone.utc)
        if "status" not in doc or not doc["status"]:
            doc["status"] = "PENDING"
        if "qr_is_used" not in doc:
            doc["qr_is_used"] = False

        result = self.collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return doc

    def get_by_student(self, student_id: str):
        items = list(
            self.collection.find(
                {"student_id": str(student_id)}
            ).sort("request_timestamp", -1)
        )
        for item in items:
            item["_id"] = str(item["_id"])
        return items

    def get_by_id(self, outpass_id: str):
        try:
            query = {"_id": ObjectId(outpass_id)}
            item = self.collection.find_one(query)
            if not item:
                item = self.collection.find_one({"_id": str(outpass_id)})
        except Exception:
            item = self.collection.find_one({"_id": str(outpass_id)})

        if item:
            item["_id"] = str(item["_id"])
        return item

    def get_all_pending(self):
        items = list(
            self.collection.find(
                {"status": "PENDING"}
            ).sort("request_timestamp", -1)
        )
        for item in items:
            item["_id"] = str(item["_id"])
        return items

    def update_status(
        self,
        outpass_id: str,
        status: str,
        warden_remarks: str = None,
        qr_code_token: str = None,
        qr_generated_at: datetime = None
    ):
        update_fields = {
            "status": status,
            "warden_remarks": warden_remarks,
            "decision_timestamp": datetime.now(timezone.utc)
        }
        if qr_code_token is not None:
            update_fields["qr_code_token"] = qr_code_token
            update_fields["qr_generated_at"] = qr_generated_at or datetime.now(timezone.utc)
            update_fields["qr_is_used"] = False

        try:
            query = {"_id": ObjectId(outpass_id)}
            res = self.collection.update_one(query, {"$set": update_fields})
            if res.modified_count == 0:
                self.collection.update_one({"_id": str(outpass_id)}, {"$set": update_fields})
        except Exception:
            self.collection.update_one({"_id": str(outpass_id)}, {"$set": update_fields})

        return self.get_by_id(outpass_id)

    def get_by_qr_token(self, qr_token: str):
        item = self.collection.find_one({"qr_code_token": str(qr_token)})
        if item:
            item["_id"] = str(item["_id"])
        return item

    def mark_qr_used(self, outpass_id: str):
        update_fields = {
            "qr_is_used": True,
            "qr_used_at": datetime.now(timezone.utc)
        }
        try:
            query = {"_id": ObjectId(outpass_id)}
            res = self.collection.update_one(query, {"$set": update_fields})
            if res.modified_count == 0:
                self.collection.update_one({"_id": str(outpass_id)}, {"$set": update_fields})
        except Exception:
            self.collection.update_one({"_id": str(outpass_id)}, {"$set": update_fields})
=======
    def get_by_student(self, student_id: str):
        return list(
            outpasses_collection.find(
                {"student_id": student_id}
            ).sort("request_timestamp", -1)
        )

    def create(self, outpass_data: dict):
        result = outpasses_collection.insert_one(outpass_data)

        created_outpass = outpasses_collection.find_one(
            {"_id": result.inserted_id}
        )

        return created_outpass
>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
