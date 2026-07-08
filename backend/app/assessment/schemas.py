from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PhysicalAssessmentCreate(BaseModel):
    date: date
    weight_kg: Decimal = Field(gt=0)
    height_cm: Decimal = Field(gt=0)
    waist_cm: Decimal | None = None
    hip_cm: Decimal | None = None
    arm_cm: Decimal | None = None
    calf_cm: Decimal | None = None
    body_fat_percent: Decimal | None = None
    muscle_mass_kg: Decimal | None = None
    notes: str | None = None


class PhysicalAssessmentUpdate(PhysicalAssessmentCreate):
    pass


class PhysicalAssessmentRead(PhysicalAssessmentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    bmi: Decimal
    created_at: datetime
    updated_at: datetime


class BioimpedanceCreate(BaseModel):
    date: date
    body_fat_percent: Decimal | None = None
    fat_mass_kg: Decimal | None = None
    lean_mass_kg: Decimal | None = None
    muscle_mass_kg: Decimal | None = None
    total_body_water_l: Decimal | None = None
    basal_metabolic_rate_kcal: Decimal | None = None
    visceral_fat_level: Decimal | None = None
    metabolic_age: int | None = None
    notes: str | None = None


class BioimpedanceUpdate(BioimpedanceCreate):
    pass


class BioimpedanceRead(BioimpedanceCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    created_at: datetime
    updated_at: datetime
