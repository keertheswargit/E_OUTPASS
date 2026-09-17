import uuid
from datetime import datetime
from backend.app.services.notification_service import NotificationService


class WardenService:

    def __init__(self, outpass_repository, notification_service_or_repo=None):
        self.outpass_repository = outpass_repository
        if isinstance(notification_service_or_repo, NotificationService):
            self.notification_service = notification_service_or_repo
        else:
            self.notification_service = NotificationService(notification_service_or_repo)

    def get_pending_outpasses(self):
        outpasses = self.outpass_repository.get_all_pending()
        for item in outpasses:
            item["_id"] = str(item["_id"])
        return outpasses

    def approve_outpass(self, outpass_id: str, warden_remarks: str = None):
        outpass = self.outpass_repository.get_by_id(outpass_id)
        if not outpass:
            raise ValueError("Outpass request not found.")

        # Generate unique QR code token for gate verification
        qr_token = f"QR-{outpass['student_id']}-{outpass_id[-6:] if len(str(outpass_id)) >= 6 else outpass_id}-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.utcnow()

        self.outpass_repository.update_status(
            outpass_id=outpass_id,
            status="APPROVED",
            warden_remarks=warden_remarks,
            qr_code_token=qr_token,
            qr_generated_at=now
        )

        # Notify student
        self.notification_service.notify_approved(
            student_id=outpass["student_id"],
            outpass_id=outpass_id
        )

        updated = self.outpass_repository.get_by_id(outpass_id)
        updated["_id"] = str(updated["_id"])
        return updated

    def reject_outpass(self, outpass_id: str, warden_remarks: str = None):
        outpass = self.outpass_repository.get_by_id(outpass_id)
        if not outpass:
            raise ValueError("Outpass request not found.")

        self.outpass_repository.update_status(
            outpass_id=outpass_id,
            status="REJECTED",
            warden_remarks=warden_remarks
        )

        # Notify student
        self.notification_service.notify_rejected(
            student_id=outpass["student_id"],
            outpass_id=outpass_id
        )

        updated = self.outpass_repository.get_by_id(outpass_id)
        updated["_id"] = str(updated["_id"])
        return updated

    def update_outpass_status(self, outpass_id: str, status: str, warden_remarks: str = None):
        if status == "APPROVED":
            return self.approve_outpass(outpass_id, warden_remarks)
        elif status == "REJECTED":
            return self.reject_outpass(outpass_id, warden_remarks)
        else:
            raise ValueError("Status must be APPROVED or REJECTED")