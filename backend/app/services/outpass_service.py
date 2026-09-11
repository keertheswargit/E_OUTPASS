class OutpassService:

    def __init__(self, repository):
        self.repository = repository

    def get_student_outpasses(self, student_id: str):
        outpasses = self.repository.get_by_student(student_id)

        for outpass in outpasses:
            outpass["_id"] = str(outpass["_id"])

        current = None
        history = []

        for outpass in outpasses:
            if outpass["status"] in ["PENDING", "APPROVED"] and current is None:
                current = outpass
            else:
                history.append(outpass)

        return current, history