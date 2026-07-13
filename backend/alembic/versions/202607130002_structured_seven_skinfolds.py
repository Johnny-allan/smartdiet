"""store seven skinfold assessment measurements

Revision ID: 202607130002
Revises: 202607130001
Create Date: 2026-07-13
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "202607130002"
down_revision: str | None = "202607130001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

COLUMNS = [
    "chest_skinfold_mm",
    "midaxillary_skinfold_mm",
    "triceps_skinfold_mm",
    "subscapular_skinfold_mm",
    "abdominal_skinfold_mm",
    "suprailiac_skinfold_mm",
    "thigh_skinfold_mm",
]


def upgrade() -> None:
    for name in COLUMNS:
        op.add_column(
            "physical_assessments",
            sa.Column(name, sa.Numeric(8, 2), nullable=True),
            schema="assessment",
        )


def downgrade() -> None:
    for name in reversed(COLUMNS):
        op.drop_column("physical_assessments", name, schema="assessment")
