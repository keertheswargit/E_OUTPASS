from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.outpass import router as outpass_router
from backend.app.api.warden import router as warden_router
from backend.app.api.notification import router as notification_router
from backend.app.api.gate import router as gate_router

app = FastAPI(title="E-Outpass Backend API")

# Allow frontend to communicate with backend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(outpass_router)
app.include_router(warden_router)
app.include_router(notification_router)
app.include_router(gate_router)


@app.get("/")
def root():
    return {"message": "E-Outpass backend API is running"}