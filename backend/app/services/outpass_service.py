from backend.app.repositories.outpass_repository import OutpassRepository


class OutpassService:

    def __init__(self, repository: OutpassRepository):
        self.repository = repository

    def get_student_outpasses(self, student_id: str):
        outpasses = self.repository.get_by_student(student_id)

        for outpass in outpasses:
            if "_id" in outpass:
                outpass["id"] = str(outpass["_id"])
                del outpass["_id"]

        current = None
        history = []

        for outpass in outpasses:
            if outpass.get("status") in ["PENDING", "APPROVED"]:
                if current is None:
                    current = outpass
                else:
                    history.append(outpass)
            else:
                history.append(outpass)

        return current, history