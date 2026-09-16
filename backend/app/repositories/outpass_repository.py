from backend.app.db.mongodb import outpasses_collection


class OutpassRepository:

    def get_by_student(self, student_id: str):
        return list(
            outpasses_collection.find(
                {"student_id": student_id}
            ).sort("request_timestamp", -1)
        )
        def get_by_id(self, outpass_id: str):
    return outpasses_collection.find_one(
        {"_id": outpass_id}
    )


def update_status(
    self,
    outpass_id: str,
    status: str,
    warden_remarks: str = None
):
    from datetime import datetime

    result = outpasses_collection.update_one(
        {"_id": outpass_id},
        {
            "$set": {
                "status": status,
                "warden_remarks": warden_remarks,
                "decision_timestamp": datetime.utcnow()
            }
        }
    )

    return result.modified_count > 0
