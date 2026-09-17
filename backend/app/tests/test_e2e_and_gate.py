import unittest
from datetime import datetime, timedelta
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
        # 1. Student submits outpass
        now = datetime.utcnow()
        submit_payload = {
            "student_id": "2024506050",
            "destination": "Bangalore",
            "reason": "Conference",
            "departure_datetime": (now + timedelta(days=1)).isoformat(),
            "return_datetime": (now + timedelta(days=3)).isoformat(),
            "parent_contact": "9876543210"
        }

        res = self.client.post("/api/outpasses/submit", json=submit_payload)
        self.assertEqual(res.status_code, 200, res.text)
        created = res.json()
        outpass_id = created["_id"]
        self.assertEqual(created["status"], "PENDING")

        # Check student views - current status should show PENDING
        res_my = self.client.get("/api/outpasses/my?student_id=2024506050")
        self.assertEqual(res_my.status_code, 200)
        my_data = res_my.json()
        self.assertIsNotNone(my_data["current"])
        self.assertEqual(my_data["current"]["status"], "PENDING")

        # 2. Warden views pending outpasses and approves it
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

        # 3. Check student notification was generated
        res_notif = self.client.get("/api/notifications/my?student_id=2024506050")
        self.assertEqual(res_notif.status_code, 200)
        notifs = res_notif.json()
        self.assertGreater(len(notifs), 0)
        self.assertEqual(notifs[0]["notification_type"], "OUTPASS_APPROVED")

        # Check student current and history views - should move to Approved in both
        res_my_after = self.client.get("/api/outpasses/my?student_id=2024506050")
        my_data_after = res_my_after.json()
        self.assertIsNotNone(my_data_after["current"])
        self.assertEqual(my_data_after["current"]["status"], "APPROVED")
        self.assertTrue(any(h["_id"] == outpass_id and h["status"] == "APPROVED" for h in my_data_after["history"]))

        # 4. AC1 Gate Verification: Valid unexpired QR token scanned
        res_gate1 = self.client.post("/api/gate/verify", json={"qr_token": qr_token})
        self.assertEqual(res_gate1.status_code, 200)
        gate_res1 = res_gate1.json()
        self.assertTrue(gate_res1["valid"])
        self.assertIn("Confirmed Valid", gate_res1["message"])
        self.assertEqual(gate_res1["outpass"]["student_id"], "2024506050")

        # 5. AC2 Gate Verification: Already-used QR code scanned again
        res_gate2 = self.client.post("/api/gate/verify", json={"qr_token": qr_token})
        self.assertEqual(res_gate2.status_code, 200)
        gate_res2 = res_gate2.json()
        self.assertFalse(gate_res2["valid"])
        self.assertIn("already been used", gate_res2["message"])

    def test_warden_rejection_flow(self):
        now = datetime.utcnow()
        submit_payload = {
            "student_id": "2024506050",
            "destination": "Goa",
            "reason": "Vacation",
            "departure_datetime": (now + timedelta(days=1)).isoformat(),
            "return_datetime": (now + timedelta(days=3)).isoformat(),
            "parent_contact": "9876543210"
        }

        res = self.client.post("/api/outpasses/submit", json=submit_payload)
        outpass_id = res.json()["_id"]

        # Warden rejects request
        res_reject = self.client.post(
            f"/api/warden/outpasses/{outpass_id}/reject",
            json={"warden_remarks": "Not allowed during semester"}
        )
        self.assertEqual(res_reject.status_code, 200)
        rejected = res_reject.json()
        self.assertEqual(rejected["status"], "REJECTED")

        # Check student notification
        res_notif = self.client.get("/api/notifications/my?student_id=2024506050")
        notifs = res_notif.json()
        self.assertEqual(notifs[0]["notification_type"], "OUTPASS_REJECTED")

        # Check history view contains Rejected request
        res_my = self.client.get("/api/outpasses/my?student_id=2024506050")
        my_data = res_my.json()
        self.assertTrue(any(h["_id"] == outpass_id and h["status"] == "REJECTED" for h in my_data["history"]))


if __name__ == "__main__":
    unittest.main()
