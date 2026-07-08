from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import Date, ForeignKey, Integer, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin


class PhysicalAssessment(Base, TimestampMixin):
    __tablename__ = "physical_assessments"
    __table_args__ = {"schema": "assessment"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.patients.id"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    weight_kg: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    height_cm: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    bmi: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    waist_cm: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    hip_cm: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    arm_cm: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    calf_cm: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    body_fat_percent: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    muscle_mass_kg: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class Bioimpedance(Base, TimestampMixin):
    __tablename__ = "bioimpedance"
    __table_args__ = {"schema": "assessment"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.patients.id"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    body_fat_percent: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    fat_mass_kg: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    lean_mass_kg: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    muscle_mass_kg: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    total_body_water_l: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    basal_metabolic_rate_kcal: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    visceral_fat_level: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    metabolic_age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
