from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.outpass import router as outpass_router
<<<<<<< HEAD
from backend.app.api.warden import router as warden_router
from backend.app.api.notification import router as notification_router
from backend.app.api.gate import router as gate_router

app = FastAPI(
    title="E-Outpass API",
    description="Smart Hostel Permission Management System API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
=======

app = FastAPI(title="E-Outpass")

# Allow frontend to communicate with backend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000"],
>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(outpass_router)
<<<<<<< HEAD
app.include_router(warden_router)
app.include_router(notification_router)
app.include_router(gate_router)
=======
>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17


@app.get("/")
def root():
<<<<<<< HEAD
    return {
        "message": "E-Outpass backend is running",
        "features": [
            "SCRUM06B-F001: Online Outpass Request Submission",
            "SCRUM06B-F002: Warden Review & Decisions",
            "SCRUM06B-F003: Student Status Tracking & History",
            "SCRUM06B-F004: In-App Status Change Notifications",
            "SCRUM06B-F005: Gate QR-Code Verification & Emergency Contact"
        ]
    }
=======
    return {"message": "E-Outpass backend is running"}
>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
