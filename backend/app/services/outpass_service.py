from datetime import datetime
from backend.app.models.outpass import Outpass


class OutpassService:

    def __init__(self, repository):
        self.repository = repository

    def create_outpass(
        self,
        student_id: str,
        destination: str,
        reason: str,
        departure_datetime: datetime,
        return_datetime: datetime,
        parent_contact: str
    ):
        if not destination or not reason or not parent_contact:
            raise ValueError("Destination, reason, and parent contact are required.")

        if departure_datetime >= return_datetime:
            raise ValueError("Return datetime must be after departure datetime.")

        new_outpass = Outpass(
            student_id=student_id,
            destination=destination,
            reason=reason,
            departure_datetime=departure_datetime,
            return_datetime=return_datetime,
            parent_contact=parent_contact,
            status="PENDING",
            request_timestamp=datetime.utcnow()
        )

        outpass_dict = {
            "student_id": new_outpass.student_id,
            "destination": new_outpass.destination,
            "reason": new_outpass.reason,
            "departure_datetime": new_outpass.departure_datetime,
            "return_datetime": new_outpass.return_datetime,
            "parent_contact": new_outpass.parent_contact,
            "request_timestamp": new_outpass.request_timestamp,
            "status": new_outpass.status,
            "warden_remarks": None,
            "decision_timestamp": None,
            "qr_code_token": None,
            "qr_is_used": False,
            "qr_generated_at": None
        }

        created = self.repository.create(outpass_dict)
        created["_id"] = str(created["_id"])
        return created

    def get_student_outpasses(self, student_id: str):
        outpasses = self.repository.get_by_student(student_id)

        for outpass in outpasses:
            outpass["_id"] = str(outpass["_id"])

        current = None
        history = []

        for outpass in outpasses:
            # Active current request is the latest PENDING or APPROVED request
            if outpass["status"] in ["PENDING", "APPROVED"] and current is None:
                current = outpass

            # History includes all requests or past requests (APPROVED, REJECTED, COMPLETED)
            if outpass["status"] in ["APPROVED", "REJECTED", "COMPLETED"]:
                history.append(outpass)

        return current, history