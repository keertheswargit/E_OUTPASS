from backend.app.repositories.outpass_repository import OutpassRepository


class OutpassService:

    def __init__(self, repository: OutpassRepository):
        self.repository = repository

    def get_student_outpasses(self, student_id: str):
        outpasses = self.repository.get_by_student(student_id)

        if not outpasses:
            return None, []

        active_statuses = {"PENDING", "APPROVED"}

        current = None

        for outpass in outpasses:
            if outpass.status in active_statuses:
                current = outpass
                break

        history = [
            outpass for outpass in outpasses
            if outpass != current
        ]

        return current, history