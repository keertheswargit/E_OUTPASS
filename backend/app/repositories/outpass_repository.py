from backend.app.db.mongodb import outpasses_collection


class OutpassRepository:

    def get_by_student(self, student_id: str):
        return list(
            outpasses_collection.find(
                {"student_id": student_id}
            ).sort("request_timestamp", -1)
        )
