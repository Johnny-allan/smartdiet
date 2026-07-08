from typing import Optional

from sqlalchemy import ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin


class Anamnesis(Base, TimestampMixin):
    __tablename__ = "anamnesis"
    __table_args__ = {"schema": "clinical"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.patients.id"), nullable=False, index=True)
    main_goal: Mapped[Optional[str]] = mapped_column(String(240), nullable=True)
    clinical_history: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    family_history: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    allergies: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    intolerances: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    medications: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    diseases: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    surgeries: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sleep_quality: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    stress_level: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    bowel_function: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    water_intake: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    alcohol_use: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    smoking: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    physical_activity: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    food_preferences: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    food_restrictions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    objective_type: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    suggested_strategy: Mapped[Optional[list[str]]] = mapped_column(JSON, nullable=True)
    suggested_meals: Mapped[Optional[dict[str, str]]] = mapped_column(JSON, nullable=True)
    suggested_goals: Mapped[Optional[list[dict]]] = mapped_column(JSON, nullable=True)


class PatientGoal(Base, TimestampMixin):
    __tablename__ = "patient_goals"
    __table_args__ = {"schema": "clinical"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.patients.id"), nullable=False, index=True)
    focus: Mapped[str] = mapped_column(String(160), nullable=False)
    metric: Mapped[str] = mapped_column(String(120), nullable=False)
    metric_type: Mapped[str] = mapped_column(String(80), nullable=False, default="number")
    unit: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    direction: Mapped[str] = mapped_column(String(20), nullable=False, default="increase")
    baseline_value: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    current_value: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    target_value: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    status: Mapped[str] = mapped_column(String(80), nullable=False, default="Em progresso")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
