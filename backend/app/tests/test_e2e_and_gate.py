import unittest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.db.mongodb import outpasses_collection, notifications_collection


class TestOutpassAndGateVerification(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)
        # Clear collections before each test
        outpasses_collection.delete_many({})
        notifications_collection.delete_many({})

    def test_student_submit_warden_approve_and_gate_verify_flow(self):
        # 1. Student submits outpass with emergency contact (SCRUM06B-F001, SCRUM06B-F005)
        now = datetime.now(timezone.utc)
        submit_payload = {
            "student_id": "2024506050",
            "destination": "Bangalore",
            "reason": "Conference",
            "departure_datetime": (now + timedelta(days=1)).isoformat(),
            "return_datetime": (now + timedelta(days=3)).isoformat(),
            "parent_contact": "9876543210",
            "emergency_contact": "9123456780"
        }

        res = self.client.post("/api/outpasses/submit", json=submit_payload)
        self.assertEqual(res.status_code, 200, res.text)
        created = res.json()
        outpass_id = created["_id"]
        self.assertEqual(created["status"], "PENDING")
        self.assertEqual(created.get("emergency_contact"), "9123456780")

        # Check student views - current status should show PENDING (SCRUM06B-F003)
        res_my = self.client.get("/api/outpasses/my?student_id=2024506050")
        self.assertEqual(res_my.status_code, 200)
        my_data = res_my.json()
        self.assertIsNotNone(my_data["current"])
        self.assertEqual(my_data["current"]["status"], "PENDING")

        # 2. Warden views pending outpasses and approves it (SCRUM06B-F002)
        res_pending = self.client.get("/api/warden/outpasses/pending")
        self.assertEqual(res_pending.status_code, 200)
        pending_list = res_pending.json()
        self.assertTrue(any(p["_id"] == outpass_id for p in pending_list))

        res_approve = self.client.post(
            f"/api/warden/outpasses/{outpass_id}/approve",
            json={"warden_remarks": "Approved by Warden"}
        )
        self.assertEqual(res_approve.status_code, 200, res_approve.text)
        approved_outpass = res_approve.json()
        self.assertEqual(approved_outpass["status"], "APPROVED")
        qr_token = approved_outpass.get("qr_code_token")
        self.assertIsNotNone(qr_token)

        # 3. Check student notification was generated (SCRUM06B-F004-BE-001)
        res_notif = self.client.get("/api/notifications/my?student_id=2024506050")
        self.assertEqual(res_notif.status_code, 200)
        notifs = res_notif.json()
        self.assertGreater(len(notifs), 0)
        self.assertEqual(notifs[0]["notification_type"], "OUTPASS_APPROVED")
        self.assertFalse(notifs[0]["is_read"])

        # Test marking individual notification as read (SCRUM06B-F004-UI-001)
        notif_id = notifs[0]["_id"]
        res_read = self.client.put(f"/api/notifications/{notif_id}/read")
        self.assertEqual(res_read.status_code, 200)
        self.assertTrue(res_read.json()["success"])

        # Check student current and history views - should move to Approved in both (SCRUM06B-F003)
        res_my_after = self.client.get("/api/outpasses/my?student_id=2024506050")
        my_data_after = res_my_after.json()
        self.assertIsNotNone(my_data_after["current"])
        self.assertEqual(my_data_after["current"]["status"], "APPROVED")
        self.assertTrue(any(h["_id"] == outpass_id and h["status"] == "APPROVED" for h in my_data_after["history"]))

        # 4. AC1 Gate Verification (SCRUM06B-F005): Valid unexpired QR token scanned
        res_gate1 = self.client.post("/api/gate/verify", json={"qr_token": qr_token})
        self.assertEqual(res_gate1.status_code, 200)
        gate_res1 = res_gate1.json()
        self.assertTrue(gate_res1["valid"])
        self.assertIn("Confirmed Valid", gate_res1["message"])
        self.assertEqual(gate_res1["outpass"]["student_id"], "2024506050")
        self.assertEqual(gate_res1["outpass"].get("emergency_contact"), "9123456780")

        # 5. AC2 Gate Verification (SCRUM06B-F005): Already-used QR code scanned again
        res_gate2 = self.client.post("/api/gate/verify", json={"qr_token": qr_token})
        self.assertEqual(res_gate2.status_code, 200)
        gate_res2 = res_gate2.json()
        self.assertFalse(gate_res2["valid"])
        self.assertIn("already been used", gate_res2["message"])

    def test_warden_rejection_flow(self):
        # Student submits outpass
        now = datetime.now(timezone.utc)
        submit_payload = {
            "student_id": "2024506050",
            "destination": "Goa",
            "reason": "Vacation",
            "departure_datetime": (now + timedelta(days=1)).isoformat(),
            "return_datetime": (now + timedelta(days=3)).isoformat(),
            "parent_contact": "9876543210"
        }

        res = self.client.post("/api/outpasses/submit", json=submit_payload)
        self.assertEqual(res.status_code, 200)
        outpass_id = res.json()["_id"]

        # Warden rejects request (SCRUM06B-F002)
        res_reject = self.client.post(
            f"/api/warden/outpasses/{outpass_id}/reject",
            json={"warden_remarks": "Not allowed during semester"}
        )
        self.assertEqual(res_reject.status_code, 200)
        rejected = res_reject.json()
        self.assertEqual(rejected["status"], "REJECTED")

        # Check student notification received for rejection (SCRUM06B-F004-BE-001)
        res_notif = self.client.get("/api/notifications/my?student_id=2024506050")
        self.assertEqual(res_notif.status_code, 200)
        notifs = res_notif.json()
        self.assertEqual(notifs[0]["notification_type"], "OUTPASS_REJECTED")

        # Check history view contains Rejected request
        res_my = self.client.get("/api/outpasses/my?student_id=2024506050")
        my_data = res_my.json()
        self.assertTrue(any(h["_id"] == outpass_id and h["status"] == "REJECTED" for h in my_data["history"]))

    def test_date_validation(self):
        # Departure after return should be rejected with 400
        now = datetime.now(timezone.utc)
        invalid_payload = {
            "student_id": "2024506050",
            "destination": "Chennai",
            "reason": "Invalid dates",
            "departure_datetime": (now + timedelta(days=5)).isoformat(),
            "return_datetime": (now + timedelta(days=2)).isoformat(),
            "parent_contact": "9876543210"
        }
        res = self.client.post("/api/outpasses/submit", json=invalid_payload)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Departure datetime must be before", res.json()["detail"])

    def test_gate_verification_invalid_token(self):
        # Invalid token scanned at gate
        res = self.client.post("/api/gate/verify", json={"qr_token": "QR-NONEXISTENT-TOKEN"})
        self.assertEqual(res.status_code, 200)
        res_data = res.json()
        self.assertFalse(res_data["valid"])
        self.assertIn("Invalid QR code token", res_data["message"])

    def test_notification_read_all(self):
        # Test marking all student notifications as read
        now = datetime.now(timezone.utc)
        notifications_collection.insert_one({
            "student_id": "2024506050",
            "message": "Notice 1",
            "is_read": False,
            "created_at": now
        })
        res = self.client.put("/api/notifications/my/read-all?student_id=2024506050")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["success"])


if __name__ == "__main__":
    unittest.main()
