from datetime import datetime, timedelta

from backend.app.db.database import SessionLocal
from backend.app.models.outpass import Outpass


def seed_data():
    db = SessionLocal()

    try:
        student_id = "2024506050"

        existing = db.query(Outpass).filter(
            Outpass.student_id == student_id
        ).first()

        if existing:
            print("Seed data already exists.")
            return

        now = datetime.now()

        outpasses = [
            Outpass(
                student_id=student_id,
                destination="Cuddalore",
                reason="Home visit",
                departure_datetime=now + timedelta(days=1),
                return_datetime=now + timedelta(days=2),
                parent_contact="9876543210",
                status="PENDING"
            ),
            Outpass(
                student_id=student_id,
                destination="Chennai",
                reason="Family function",
                departure_datetime=now - timedelta(days=10),
                return_datetime=now - timedelta(days=9),
                parent_contact="9876543210",
                status="APPROVED",
                warden_remarks="Approved",
                decision_timestamp=now - timedelta(days=11)
            ),
            Outpass(
                student_id=student_id,
                destination="Pondicherry",
                reason="Personal work",
                departure_datetime=now - timedelta(days=20),
                return_datetime=now - timedelta(days=19),
                parent_contact="9876543210",
                status="REJECTED",
                warden_remarks="Insufficient reason",
                decision_timestamp=now - timedelta(days=21)
            ),
            Outpass(
                student_id=student_id,
                destination="Villupuram",
                reason="Medical appointment",
                departure_datetime=now - timedelta(days=30),
                return_datetime=now - timedelta(days=29),
                parent_contact="9876543210",
                status="COMPLETED",
                warden_remarks="Approved",
                decision_timestamp=now - timedelta(days=31)
            )
        ]

        db.add_all(outpasses)
        db.commit()

        print("Seed data inserted successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_data()