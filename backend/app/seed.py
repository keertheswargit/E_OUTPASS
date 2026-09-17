from datetime import datetime, timedelta
from backend.app.db.mongodb import outpasses_collection, notifications_collection


def seed_data():
    student_id = "2024506050"

    # Check if data already exists
    if outpasses_collection.count_documents({"student_id": student_id}) > 0:
        print("Seed data already exists.")
        return

    now = datetime.utcnow()

    seed_outpasses = [
        {
            "student_id": student_id,
            "destination": "Cuddalore",
            "reason": "Home visit for weekend",
            "departure_datetime": now + timedelta(days=1),
            "return_datetime": now + timedelta(days=3),
            "parent_contact": "9876543210",
            "request_timestamp": now - timedelta(hours=2),
            "status": "PENDING",
            "warden_remarks": None,
            "decision_timestamp": None,
            "qr_code_token": None,
            "qr_is_used": False,
            "qr_generated_at": None
        },
        {
            "student_id": student_id,
            "destination": "Chennai",
            "reason": "Family function",
            "departure_datetime": now - timedelta(days=10),
            "return_datetime": now - timedelta(days=8),
            "parent_contact": "9876543210",
            "request_timestamp": now - timedelta(days=11),
            "status": "APPROVED",
            "warden_remarks": "Approved by Warden",
            "decision_timestamp": now - timedelta(days=11),
            "qr_code_token": f"QR-{student_id}-HIST01-SECURE99",
            "qr_is_used": True,
            "qr_generated_at": now - timedelta(days=11)
        },
        {
            "student_id": student_id,
            "destination": "Pondicherry",
            "reason": "Personal work",
            "departure_datetime": now - timedelta(days=20),
            "return_datetime": now - timedelta(days=19),
            "parent_contact": "9876543210",
            "request_timestamp": now - timedelta(days=21),
            "status": "REJECTED",
            "warden_remarks": "Insufficient reason provided",
            "decision_timestamp": now - timedelta(days=21),
            "qr_code_token": None,
            "qr_is_used": False,
            "qr_generated_at": None
        }
    ]

    outpasses_collection.insert_many(seed_outpasses)

    seed_notifications = [
        {
            "student_id": student_id,
            "message": "Your outpass request to Chennai has been approved.",
            "outpass_id": "historical_1",
            "notification_type": "OUTPASS_APPROVED",
            "is_read": False,
            "created_at": now - timedelta(days=11)
        },
        {
            "student_id": student_id,
            "message": "Your outpass request to Pondicherry has been rejected.",
            "outpass_id": "historical_2",
            "notification_type": "OUTPASS_REJECTED",
            "is_read": False,
            "created_at": now - timedelta(days=21)
        }
    ]

    notifications_collection.insert_many(seed_notifications)

    print("Seed data inserted successfully.")


if __name__ == "__main__":
    seed_data()