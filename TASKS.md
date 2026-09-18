# E-Outpass - Project Tasks & Backlog

This document tracks all Epics, User Stories, Acceptance Criteria, and implementation statuses for the **E-Outpass (Smart Hostel Permission Management System)** project.

---

## Epics Overview

| Epic ID | Epic Name | Source Document | Status |
| :--- | :--- | :--- | :--- |
| **SCRUM06B-F001** | Online Outpass Request Submission | Scrum_6_Idea.docx | Completed |
| **SCRUM06B-F002** | Warden Review, Verification & Approval | Scrum_6_Idea.docx | Completed |
| **SCRUM06B-F003** | Student Status Tracking & Outpass History | Scrum_6_Idea.docx | Completed |
| **SCRUM06B-F004** | Status Notifications | Scrum_6_Idea.docx | Completed |
| **SCRUM06B-F005** | QR-Based Verification & Emergency Contact Support (Future Scope) | Scrum_6_Idea.docx | Completed |

---

## Detailed User Stories & Tasks

### Feature SCRUM06B-F001: Online Outpass Request Submission
- **Description**: Students submit a digital outpass request specifying destination, reason, departure time, return time, and contact details, replacing the paper-form process.
- **Tasks**:
  - `SCRUM06B-F001-UI-001`: Outpass request submission form with validation.
  - `SCRUM06B-F001-BE-001`: Outpass request creation API (`POST /api/outpasses/submit`).
  - `SCRUM06B-F001-DB-001`: Outpass request data store schema and persistence.

---

### Feature SCRUM06B-F002: Warden Review, Verification & Approval
- **Description**: Wardens view pending outpass requests, verify student details, and approve or reject requests.
- **Tasks**:
  - `SCRUM06B-F002-UI-001`: Warden pending-requests review screen.
  - `SCRUM06B-F002-BE-001`: Outpass approval/rejection API (`POST /api/warden/outpasses/{id}/approve` & `reject`).
  - `SCRUM06B-F002-DB-001`: Outpass status history audit log and timestamping.

---

### Feature SCRUM06B-F003: Student Status Tracking & Outpass History
- **Description**: Students track the status of their current outpass request and view their previous outpass history.
- **Tasks**:
  - `SCRUM06B-F003-UI-001`: "My Outpasses" status & history screen with filtering and search.
  - `SCRUM06B-F003-BE-001`: Student outpass history & status retrieval API (`GET /api/outpasses/my`).

---

### Feature SCRUM06B-F004: Status Notifications

#### Story ID: SCRUM06B-F004-UI-001
- **User Story**: *As a student, I want to see a notification when my outpass request status changes, so that I know the outcome without repeatedly checking the app.*
- **Description**: In-app notification badge/toast triggered on status change.
- **Business Value**: Improves communication and reduces manual status-checking.
- **Acceptance Criteria**:
  - **AC1**: Given a student's request status changes, when they next open or are using the app, then a notification indicating the new status is shown.
- **Dependencies**: Depends on Backend notification trigger service (`SCRUM06B-F004-BE-001`).
- **Assumptions**: In-app notification indicator at minimum; toast alert for real-time awareness.
- **Technical Notes**: Notification bell in UI with unread counter, dropdown drawer listing history, and animated toast popup.
- **Definition of Done**: Notification UI implemented, interactive, and tested.
- **Status**: Completed

#### Story ID: SCRUM06B-F004-BE-001
- **User Story**: *As the system, I want to dispatch a notification whenever an outpass request's status changes, so that the student is kept informed.*
- **Description**: Backend service listening for status-change events and dispatching notifications to the relevant student.
- **Business Value**: Automates the communication loop between warden action and student awareness.
- **Acceptance Criteria**:
  - **AC1**: Given a request status changes, when processed, then a notification event is dispatched to the requesting student and delivery is logged.
- **Dependencies**: Depends on Outpass status history and a notification channel.
- **Assumptions**: In-app notification store at minimum; SMS/email/push TBD.
- **Technical Notes**: Endpoints `GET /api/notifications/my` and `PUT /api/notifications/{id}/read`; notification repository logs to MongoDB.
- **Definition of Done**: Service implemented, integrated with Warden service, and tested.
- **Status**: Completed

#### Story ID: SCRUM06B-F004-INT-001 (Future Scope)
- **User Story**: *As the system, I want to send SMS or email notifications for status changes, so that students are reached even outside the app.*
- **Status**: Future Scope / Conditional on provider selection.

---

### Feature SCRUM06B-F005: QR-Based Verification & Emergency Contact Support

- **Classification**: Explicit Requirement (Future Scope implemented)
- **Source Document**: `Scrum_6_Idea.docx`
- **Description**: Enhancement features: QR-code-based verification of approved outpasses (at the gate) and emergency contact support.
- **Business Objective**: Speed up physical gate verification and improve safety/emergency responsiveness.
- **Actors/Roles**: Student, Security/Gate Staff
- **Functional Requirements**:
  1. Generate a secure QR code token for an approved outpass.
  2. Allow gate/security staff to scan and verify the QR code.
  3. Capture and display emergency contact information for security use.
- **Dependencies**: Depends on Feature `SCRUM06B-F002` (approval) to have an approved request.

#### Story ID: SCRUM06B-F005-UI-001
- **User Story**: *As a student, I want to see a QR code on my approved outpass, so that gate staff can verify it quickly.*
- **Acceptance Criteria**:
  - **AC1**: Given a request is Approved, when the student views the outpass card, then a verifiable QR code representing that approval is displayed along with emergency contact details.
- **Definition of Done**: Dynamic QR code rendering implemented in frontend outpass view.
- **Status**: Completed

#### Story ID: SCRUM06B-F005-BE-001
- **User Story**: *As gate/security staff, I want to scan a student's QR code and get an instant valid/invalid result, so that I can verify outpasses quickly at the gate.*
- **Acceptance Criteria**:
  - **AC1**: Given a valid, unexpired QR code is scanned, when processed, then gate staff sees a confirmed valid result with student and request details.
  - **AC2**: Given an invalid or already-used QR code is scanned, when processed, then gate staff sees a clear invalid/rejected result.
- **Definition of Done**: Gate verification service (`POST /api/gate/verify`) implemented, preventing token reuse and enforcing validity.
- **Status**: Completed

---

## End-to-End User Journey

### Story ID: SCRUM06B-E2E-001
- **Covers Features**: SCRUM06B-F001, SCRUM06B-F002, SCRUM06B-F003, SCRUM06B-F004, SCRUM06B-F005
- **Business Journey**: Student submits outpass request → Warden reviews and approves it → Student receives status-change notification and toast alert → Student sees approved status and QR code with emergency contact → Security gate staff scans/verifies QR code → Pass is marked used.
- **Acceptance Criteria**:
  - **AC1**: Complete workflow verified from student submission to gate verification and notification logging.
- **Status**: Verified by automated test suite (`backend/app/tests/test_e2e_and_gate.py`).
