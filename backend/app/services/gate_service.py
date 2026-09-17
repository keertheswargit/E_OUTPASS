from datetime import datetime
from backend.app.repositories.outpass_repository import OutpassRepository


class GateService:

    def __init__(self, outpass_repository: OutpassRepository):
        self.outpass_repository = outpass_repository

    def verify_qr_token(self, qr_token: str):
        if not qr_token:
            return {
                "valid": False,
                "message": "QR code token is required.",
                "outpass": None
            }

        outpass = self.outpass_repository.get_by_qr_token(qr_token.strip())

        if not outpass:
            return {
                "valid": False,
                "message": "Invalid QR code token. No matching request found.",
                "outpass": None
            }

        outpass["_id"] = str(outpass["_id"])

        if outpass.get("status") != "APPROVED":
            return {
                "valid": False,
                "message": f"Outpass status is '{outpass.get('status')}', not APPROVED.",
                "outpass": outpass
            }

        if outpass.get("qr_is_used"):
            return {
                "valid": False,
                "message": "QR Code has already been used for gate entry/exit.",
                "outpass": outpass
            }

        now = datetime.utcnow()
        return_time = outpass.get("return_datetime")

        if isinstance(return_time, datetime) and now > return_time:
            return {
                "valid": False,
                "message": "QR Code has expired. Outpass return time has passed.",
                "outpass": outpass
            }

        # Valid, unexpired, unused QR code -> Mark as used
        self.outpass_repository.mark_qr_used(outpass["_id"])
        outpass["qr_is_used"] = True

        return {
            "valid": True,
            "message": "Confirmed Valid - Gate Access Granted",
            "outpass": outpass
        }
