"""structured patient goal metrics

Revision ID: 202607080002
Revises: 202607080001
Create Date: 2026-07-08
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "202607080002"
down_revision: str | None = "202607080001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "patient_goals",
        sa.Column("metric_type", sa.String(80), nullable=False, server_default="number"),
        schema="clinical",
    )
    op.add_column("patient_goals", sa.Column("unit", sa.String(40), nullable=True), schema="clinical")
    op.add_column(
        "patient_goals",
        sa.Column("direction", sa.String(20), nullable=False, server_default="increase"),
        schema="clinical",
    )
    op.add_column("patient_goals", sa.Column("baseline_value", sa.String(80), nullable=True), schema="clinical")
    op.alter_column("patient_goals", "metric_type", server_default=None, schema="clinical")
    op.alter_column("patient_goals", "direction", server_default=None, schema="clinical")


def downgrade() -> None:
    op.drop_column("patient_goals", "baseline_value", schema="clinical")
    op.drop_column("patient_goals", "direction", schema="clinical")
    op.drop_column("patient_goals", "unit", schema="clinical")
    op.drop_column("patient_goals", "metric_type", schema="clinical")
