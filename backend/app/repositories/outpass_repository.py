from backend.app.db.mongodb import outpasses_collection


class OutpassRepository:

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