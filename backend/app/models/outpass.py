from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.db.database import Base


class Outpass(Base):
    __tablename__ = "outpasses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    student_id: Mapped[str] = mapped_column(String(20), index=True)

    destination: Mapped[str] = mapped_column(String(200))

    reason: Mapped[str] = mapped_column(Text)

    departure_datetime: Mapped[datetime] = mapped_column(DateTime)

    return_datetime: Mapped[datetime] = mapped_column(DateTime)

    parent_contact: Mapped[str] = mapped_column(String(20))

    request_timestamp: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="PENDING"
    )

    warden_remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    decision_timestamp: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )