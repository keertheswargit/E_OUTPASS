import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db  # adjust to your project's DB session dependency
from app.dependencies.auth import CurrentUser, require_warden
from app.models.outpass import OutpassRequest, OutpassStatus, OutpassStatusHistory
from app.schemas.outpass import OutpassDecisionRequest, OutpassRequestOut

router = APIRouter(prefix="/outpass", tags=["outpass"])


@router.patch("/{request_id}/decision", response_model=OutpassRequestOut)
def decide_outpass_request(
    request_id: uuid.UUID,
    payload: OutpassDecisionRequest,
    db: Session = Depends(get_db),
    warden: CurrentUser = Depends(require_warden),  # AC2: 403 if not a warden
):
    """
    SCRUM06B-F002-BE-001 (approve/reject) +
    SCRUM06B-F002-DB-001 (append-only status history)

    AC1: transitions a Pending request to Approved/Rejected and appends
    a history entry in the same transaction — never overwrites prior history.
    """
    if payload.decision not in (OutpassStatus.APPROVED, OutpassStatus.REJECTED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="decision must be 'Approved' or 'Rejected'.",
        )

    outpass = (
        db.query(OutpassRequest)
        .filter(OutpassRequest.id == request_id)
        .with_for_update()  # lock the row to avoid a race between two wardens
        .first()
    )
    if outpass is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outpass request not found.")

    if outpass.status != OutpassStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Request is already '{outpass.status.value}', cannot be re-decided.",
        )

    outpass.status = payload.decision

    history_entry = OutpassStatusHistory(
        request_id=outpass.id,
        status=payload.decision,
        changed_by_warden_id=warden.id,
        remarks=payload.remarks,
    )
    db.add(history_entry)

    db.commit()
    db.refresh(outpass)
    return outpass
