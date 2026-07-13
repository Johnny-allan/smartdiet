from pydantic import BaseModel


class PatientReportSummary(BaseModel):
    patient_id: int
    patient_name: str
    patient_status: str
    sections: list[str]
    export_pdf_available: bool
    main_goal: str | None = None
    clinical_history: str | None = None
    food_restrictions: str | None = None
    latest_weight_kg: str | None = None
    latest_bmi: str | None = None
    latest_body_fat_percent: str | None = None
    latest_assessment_date: str | None = None
    active_meal_plan: str | None = None
    assessment_count: int = 0
    bioimpedance_count: int = 0
    meal_plan_count: int = 0
    diary_count: int = 0
    goal_count: int = 0
