"""create outpass_status_history table

Revision ID: 0001_outpass_status_history
Revises:
Create Date: 2026-09-18
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_outpass_status_history"
down_revision = None  # set this to your actual previous migration's revision id
branch_labels = None
depends_on = None

outpass_status_enum = postgresql.ENUM(
    "Pending", "Approved", "Rejected", name="outpass_status", create_type=False
)


def upgrade():
    outpass_status_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "outpass_status_history",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "request_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("outpass_requests.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("status", outpass_status_enum, nullable=False),
        sa.Column("changed_by_warden_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.Column(
            "changed_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_outpass_status_history_request_id",
        "outpass_status_history",
        ["request_id"],
    )


def downgrade():
    op.drop_index("ix_outpass_status_history_request_id", table_name="outpass_status_history")
    op.drop_table("outpass_status_history")
    outpass_status_enum.drop(op.get_bind(), checkfirst=True)
