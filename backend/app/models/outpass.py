from datetime import datetime


class Outpass:
    def __init__(
        self,
        student_id: str,
        destination: str,
        reason: str,
        departure_datetime: datetime,
        return_datetime: datetime,
        parent_contact: str,
        request_timestamp: datetime = None,
        status: str = "PENDING",
        warden_remarks: str = None,
        decision_timestamp: datetime = None
    ):
        self.student_id = student_id
        self.destination = destination
        self.reason = reason
        self.departure_datetime = departure_datetime
        self.return_datetime = return_datetime
        self.parent_contact = parent_contact
        self.request_timestamp = request_timestamp or datetime.utcnow()
        self.status = status
        self.warden_remarks = warden_remarks
        self.decision_timestamp = decision_timestamp