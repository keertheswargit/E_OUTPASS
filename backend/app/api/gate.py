from fastapi import APIRouter
from backend.app.schemas.outpass_schema import GateVerifyRequest, GateVerifyResponse
from backend.app.repositories.outpass_repository import OutpassRepository
from backend.app.services.gate_service import GateService


router = APIRouter(
    prefix="/api/gate",
    tags=["Gate Verification"]
)


def get_gate_service():
    repository = OutpassRepository()
    return GateService(repository)


@router.post("/verify", response_model=GateVerifyResponse)
def verify_qr_token(request: GateVerifyRequest):
    service = get_gate_service()
    result = service.verify_qr_token(request.qr_token)
    return result
