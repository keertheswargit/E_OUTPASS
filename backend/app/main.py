from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.outpass import router as outpass_router

app = FastAPI(title="E-Outpass")

# Allow frontend to communicate with backend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(outpass_router)


@app.get("/")
def root():
    return {"message": "E-Outpass backend is running"}