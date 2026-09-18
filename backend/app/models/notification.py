from datetime import datetime, timezone


class Notification:
    def __init__(
        self,
        student_id: str,
        message: str,
        outpass_id: str,
        notification_type: str = "OUTPASS_STATUS",
        is_read: bool = False,
        created_at: datetime = None
    ):
        self.student_id = student_id
        self.message = message
        self.outpass_id = outpass_id
        self.notification_type = notification_type
        self.is_read = is_read
        self.created_at = created_at or datetime.now(timezone.utc)
