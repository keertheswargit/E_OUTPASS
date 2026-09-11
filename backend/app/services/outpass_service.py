from backend.app.repositories.outpass_repository import OutpassRepository


class OutpassService:

    def __init__(self, repository: OutpassRepository):
        self.repository = repository

    def get_pending_outpasses(self):
        outpasses = self.repository.get_pending_outpasses()

        for outpass in outpasses:
            outpass["_id"] = str(outpass["_id"])

        return outpasses

    def approve_outpass(self, outpass_id):
        return self.repository.update_status(
            outpass_id,
            "APPROVED"
        )

    def reject_outpass(self, outpass_id):
        return self.repository.update_status(
            outpass_id,
            "REJECTED"
        )