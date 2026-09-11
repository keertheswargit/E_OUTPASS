from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.outpass import Outpass


class OutpassRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_student(self, student_id: str):
        statement = (
            select(Outpass)
            .where(Outpass.student_id == student_id)
            .order_by(Outpass.request_timestamp.desc())
        )

        return self.db.scalars(statement).all()