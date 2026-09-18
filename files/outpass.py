import enum
import uuid

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base  # adjust import to match your project's Base


class OutpassStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class OutpassRequest(Base):
    """
    Minimal stand-in for the existing outpass request table.
    If this model already exists in your codebase, skip this class and
    just make sure it has an `id` (UUID) and `status` (OutpassStatus) column,
    then wire the `history` relationship below into it.
    """

    __tablename__ = "outpass_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), nullable=False)
    status = Column(
        Enum(OutpassStatus, name="outpass_status"),
        nullable=False,
        default=OutpassStatus.PENDING,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    history = relationship(
        "OutpassStatusHistory",
        back_populates="request",
        order_by="OutpassStatusHistory.changed_at",
    )


class OutpassStatusHistory(Base):
    """
    SCRUM06B-F002-DB-001
    Append-only audit trail of status changes per outpass request.
    Never update/delete a row here — only ever INSERT.
    """

    __tablename__ = "outpass_status_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(
        UUID(as_uuid=True),
        ForeignKey("outpass_requests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status = Column(Enum(OutpassStatus, name="outpass_status"), nullable=False)
    changed_by_warden_id = Column(UUID(as_uuid=True), nullable=False)
    remarks = Column(Text, nullable=True)
    changed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    request = relationship("OutpassRequest", back_populates="history")
