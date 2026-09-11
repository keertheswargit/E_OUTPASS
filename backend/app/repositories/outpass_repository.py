from backend.app.db.mongodb import outpasses_collection


class OutpassRepository:

    def get_pending_outpasses(self):
        return list(
            outpasses_collection.find(
                {"status": "PENDING"}
            ).sort("request_timestamp", -1)
        )

    def get_by_id(self, outpass_id):
        from bson import ObjectId

        return outpasses_collection.find_one(
            {"_id": ObjectId(outpass_id)}
        )

    def update_status(self, outpass_id, status):
        from bson import ObjectId
        from datetime import datetime

        return outpasses_collection.update_one(
            {"_id": ObjectId(outpass_id), "status": "PENDING"},
            {
                "$set": {
                    "status": status,
                    "decision_timestamp": datetime.utcnow()
                }
            }
        )