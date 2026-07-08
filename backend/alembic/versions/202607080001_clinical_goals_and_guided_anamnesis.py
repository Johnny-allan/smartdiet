"""clinical goals and guided anamnesis

Revision ID: 202607080001
Revises: 202607070001
Create Date: 2026-07-08
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "202607080001"
down_revision: str | None = "202607070001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("anamnesis", sa.Column("objective_type", sa.String(120), nullable=True), schema="clinical")
    op.add_column("anamnesis", sa.Column("suggested_strategy", sa.JSON(), nullable=True), schema="clinical")
    op.add_column("anamnesis", sa.Column("suggested_meals", sa.JSON(), nullable=True), schema="clinical")
    op.add_column("anamnesis", sa.Column("suggested_goals", sa.JSON(), nullable=True), schema="clinical")

    op.create_table(
        "patient_goals",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.patients.id"), nullable=False),
        sa.Column("focus", sa.String(160), nullable=False),
        sa.Column("metric", sa.String(120), nullable=False),
        sa.Column("current_value", sa.String(80), nullable=True),
        sa.Column("target_value", sa.String(80), nullable=True),
        sa.Column("status", sa.String(80), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        schema="clinical",
    )
    op.create_index("ix_clinical_patient_goals_patient_id", "patient_goals", ["patient_id"], schema="clinical")


def downgrade() -> None:
    op.drop_index("ix_clinical_patient_goals_patient_id", table_name="patient_goals", schema="clinical")
    op.drop_table("patient_goals", schema="clinical")
    op.drop_column("anamnesis", "suggested_goals", schema="clinical")
    op.drop_column("anamnesis", "suggested_meals", schema="clinical")
    op.drop_column("anamnesis", "suggested_strategy", schema="clinical")
    op.drop_column("anamnesis", "objective_type", schema="clinical")
