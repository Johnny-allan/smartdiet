from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class AnamnesisCreate(BaseModel):
    main_goal: str | None = None
    clinical_history: str | None = None
    family_history: str | None = None
    allergies: str | None = None
    intolerances: str | None = None
    medications: str | None = None
    diseases: str | None = None
    surgeries: str | None = None
    sleep_quality: str | None = None
    stress_level: str | None = None
    bowel_function: str | None = None
    water_intake: str | None = None
    alcohol_use: str | None = None
    smoking: str | None = None
    physical_activity: str | None = None
    food_preferences: str | None = None
    food_restrictions: str | None = None
    objective_type: str | None = None
    suggested_strategy: list[str] | None = None
    suggested_meals: dict[str, str] | None = None
    suggested_goals: list[dict] | None = None


class AnamnesisRead(AnamnesisCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    created_at: datetime
    updated_at: datetime


class PatientGoalCreate(BaseModel):
    focus: str
    metric: str
    metric_type: str = "number"
    unit: str | None = None
    direction: Literal["increase", "decrease", "range"] = "increase"
    baseline_value: str | None = None
    current_value: str | None = None
    target_value: str | None = None
    status: str = "Em progresso"
    notes: str | None = None


class PatientGoalUpdate(BaseModel):
    focus: str | None = None
    metric: str | None = None
    metric_type: str | None = None
    unit: str | None = None
    direction: Literal["increase", "decrease", "range"] | None = None
    baseline_value: str | None = None
    current_value: str | None = None
    target_value: str | None = None
    status: str | None = None
    notes: str | None = None


class PatientGoalRead(PatientGoalCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    created_at: datetime
    updated_at: datetime
