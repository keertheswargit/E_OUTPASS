from datetime import datetime


class OutpassService:

    def __init__(self, repository):
        self.repository = repository

    def create_outpass(self, outpass_data: dict):
        outpass_data["request_timestamp"] = datetime.utcnow()
        outpass_data["status"] = "PENDING"
        outpass_data["warden_remarks"] = None
        outpass_data["decision_timestamp"] = None

        created_outpass = self.repository.create(outpass_data)

        created_outpass["id"] = str(created_outpass.pop("_id"))

        return created_outpass

    def get_student_outpasses(self, student_id: str):
        outpasses = self.repository.get_by_student(student_id)

        for outpass in outpasses:
            outpass["id"] = str(outpass.pop("_id"))

        current = None
        history = []

        for outpass in outpasses:
            if outpass["status"] in ["PENDING", "APPROVED"] and current is None:
                current = outpass
            else:
                history.append(outpass)

        return current, history