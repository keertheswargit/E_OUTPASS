# E-Outpass: Smart Hostel Permission Management System

A digital hostel permission and outpass management platform enabling students to request outpasses online, wardens to review and approve/reject requests, students to receive status change notifications and track history, and security gate staff to verify passes via digital QR codes.

---

## Features & Implemented Stories

### 1. Online Outpass Request Submission (`SCRUM06B-F001`)
- Digital submission of outpasses with destination, reason, departure/return dates, and contact details.
- Validates that departure is earlier than return time.

### 2. Warden Review & Approval Workflow (`SCRUM06B-F002`)
- Wardens inspect pending student requests.
- Single-click **Approve** or **Reject** with optional warden remarks.
- Transitions status and appends audit logs.

### 3. Student Outpass Tracking & History (`SCRUM06B-F003`)
- Real-time display of the student's active request (`Pending` or `Approved`).
- Historical archive of previous outpasses with status filters (`Approved`, `Rejected`, `Completed`) and text search.

### 4. Status Notifications (`SCRUM06B-F004`)
- **`SCRUM06B-F004-UI-001`**: In-app notification indicator (bell icon with dynamic unread count badge), notification drawer with mark-as-read functionality, and animated toast alerts displayed on status change.
- **`SCRUM06B-F004-BE-001`**: Backend service dispatching notifications when a warden approves or rejects a request, logged in the persistent notification store.

### 5. QR-Based Gate Verification & Emergency Contact Support (`SCRUM06B-F005`)
- **`SCRUM06B-F005-UI-001`**: Dynamic QR code rendered on the student's approved outpass card, accompanied by emergency contact information for quick security access.
- **`SCRUM06B-F005-BE-001`**: Gate verification API (`/api/gate/verify`) validating QR tokens against expiration and preventing token reuse at gate check-in/out.

---

## Architecture & Tech Stack

- **Backend**: Python FastAPI with modular service/repository architecture.
- **Database**: MongoDB (via `pymongo`) storing outpasses, audit history, and notification documents.
- **Frontend**: Lightweight vanilla JavaScript, HTML5, CSS3 with responsive card layouts, notification toasts, and dynamic QR rendering.
- **Testing**: Python `unittest` + FastAPI `TestClient` covering the full end-to-end lifecycle (`backend/app/tests/test_e2e_and_gate.py`).

---

## Project Structure

```
E_OUTPASS/
├── backend/
│   ├── app/
│   │   ├── api/                  # API Routers
│   │   │   ├── gate.py           # Gate verification router (F005)
│   │   │   ├── notification.py   # Notifications router (F004)
│   │   │   ├── outpass.py        # Outpass submission & student history (F001, F003)
│   │   │   └── warden.py         # Warden review & decisions (F002)
│   │   ├── db/
│   │   │   └── mongodb.py        # MongoDB connection & collections
│   │   ├── models/               # Domain models
│   │   │   ├── notification.py
│   │   │   └── outpass.py
│   │   ├── repositories/         # Data persistence layer
│   │   │   ├── notification_repository.py
│   │   │   └── outpass_repository.py
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   │   └── outpass_schema.py
│   │   ├── services/             # Business logic layer
│   │   │   ├── gate_service.py
│   │   │   ├── notification_service.py
│   │   │   ├── outpass_service.py
│   │   │   └── warden_service.py
│   │   ├── tests/
│   │   │   └── test_e2e_and_gate.py
│   │   └── main.py               # FastAPI application entry point
│   └── requirements.txt
├── frontend/
│   ├── css/
│   │   └── style.css             # UI styling, badge, toast & QR styles
│   ├── js/
│   │   └── outpass.js            # Frontend logic, notifications, QR rendering
│   └── index.html                # Single-page interface
├── TASKS.md                      # Detailed user stories and backlog tracking
└── README.md                     # Project documentation
```

---

## REST API Reference

| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/api/outpasses/submit` | Submit a new outpass request (`PENDING`) |
| `GET` | `/api/outpasses/my?student_id={id}` | Retrieve active request and past history |
| `GET` | `/api/warden/outpasses/pending` | Fetch all pending requests for warden review |
| `POST` | `/api/warden/outpasses/{id}/approve` | Approve request, generate QR token, notify student |
| `POST` | `/api/warden/outpasses/{id}/reject` | Reject request and notify student |
| `GET` | `/api/notifications/my?student_id={id}` | Get notifications for student |
| `PUT` | `/api/notifications/{id}/read` | Mark a notification as read |
| `POST` | `/api/gate/verify` | Gate verification of QR token (enforces one-time entry/exit) |

---

## Running the Application

### 1. Backend Setup
```bash
# Ensure MongoDB is running locally on mongodb://localhost:27017
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

### 2. Frontend Setup
Open `frontend/index.html` in your browser or serve it using any HTTP server:
```bash
npx serve frontend -p 3000
# or python -m http.server 3000 --directory frontend
```

### 3. Run Automated Tests
```bash
python -m unittest backend/app/tests/test_e2e_and_gate.py
```
