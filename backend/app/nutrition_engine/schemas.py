from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, model_validator


Sex = Literal["female", "male"]
ActivityLevel = Literal["sedentary", "light", "moderate", "active", "very_active"]
EnergyFormula = Literal["mifflin", "harris_benedict", "cunningham"]
Objective = Literal["fat_loss", "maintenance", "lean_mass_gain", "weight_gain", "glycemic_control"]
SubstitutionStrategy = Literal["kcal", "carbs", "protein"]


class EnergyTargetRequest(BaseModel):
    sex: Sex
    age: int = Field(ge=10, le=100)
    weight_kg: Decimal = Field(gt=0)
    height_cm: Decimal = Field(gt=0)
    activity_level: ActivityLevel = "moderate"
    objective: Objective = "maintenance"
    formula: EnergyFormula = "mifflin"
    lean_mass_kg: Decimal | None = Field(default=None, gt=0)
    custom_adjustment_kcal: Decimal | None = None


class EnergyTargetRead(BaseModel):
    formula: EnergyFormula
    bmr_kcal: Decimal
    activity_factor: Decimal
    tdee_kcal: Decimal
    objective_adjustment_kcal: Decimal
    target_kcal: Decimal


class MacroTargetRequest(BaseModel):
    target_kcal: Decimal = Field(gt=0)
    weight_kg: Decimal = Field(gt=0)
    objective: Objective = "maintenance"
    lean_mass_kg: Decimal | None = Field(default=None, gt=0)
    protein_g_per_kg: Decimal | None = Field(default=None, gt=0)
    fat_percent: Decimal | None = Field(default=None, gt=0, le=50)


class MacroTargetRead(BaseModel):
    protein_g: Decimal
    protein_kcal: Decimal
    protein_percent: Decimal
    carbs_g: Decimal
    carbs_kcal: Decimal
    carbs_percent: Decimal
    fat_g: Decimal
    fat_kcal: Decimal
    fat_percent: Decimal


class NutritionFoodInput(BaseModel):
    name: str = Field(min_length=1, max_length=180)
    grams: Decimal = Field(gt=0)
    kcal_per_100g: Decimal | None = Field(default=None, ge=0)
    protein_per_100g: Decimal | None = Field(default=None, ge=0)
    carbs_per_100g: Decimal | None = Field(default=None, ge=0)
    fat_per_100g: Decimal | None = Field(default=None, ge=0)
    fiber_per_100g: Decimal | None = Field(default=None, ge=0)
    sodium_per_100g: Decimal | None = Field(default=None, ge=0)


class MealAnalysisInput(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    items: list[NutritionFoodInput] = Field(default_factory=list)


class NutrientTotals(BaseModel):
    kcal: Decimal
    protein_g: Decimal
    carbs_g: Decimal
    fat_g: Decimal
    fiber_g: Decimal
    sodium_mg: Decimal


class MealAnalysisRead(BaseModel):
    name: str
    totals: NutrientTotals


class MealPlanAnalyzeRequest(BaseModel):
    meals: list[MealAnalysisInput] = Field(min_length=1)
    target_kcal: Decimal | None = Field(default=None, gt=0)
    target_protein_g: Decimal | None = Field(default=None, gt=0)
    target_carbs_g: Decimal | None = Field(default=None, gt=0)
    target_fat_g: Decimal | None = Field(default=None, gt=0)


class AdequacyRead(BaseModel):
    kcal_percent: Decimal | None = None
    protein_percent: Decimal | None = None
    carbs_percent: Decimal | None = None
    fat_percent: Decimal | None = None


class MealPlanAnalyzeRead(BaseModel):
    meals: list[MealAnalysisRead]
    daily_totals: NutrientTotals
    adequacy: AdequacyRead


class EquivalentSubstitutionRequest(BaseModel):
    reference_food: NutritionFoodInput
    candidate_food: NutritionFoodInput
    strategy: SubstitutionStrategy = "kcal"

    @model_validator(mode="after")
    def require_candidate_target_nutrient(self) -> "EquivalentSubstitutionRequest":
        source = {
            "kcal": self.candidate_food.kcal_per_100g,
            "carbs": self.candidate_food.carbs_per_100g,
            "protein": self.candidate_food.protein_per_100g,
        }[self.strategy]
        if source is None or source <= 0:
            raise ValueError("Candidate food must have a positive nutrient value for the selected strategy")
        return self


class EquivalentSubstitutionRead(BaseModel):
    strategy: SubstitutionStrategy
    reference_grams: Decimal
    candidate_grams: Decimal
    reference_totals: NutrientTotals
    candidate_totals: NutrientTotals
    delta: NutrientTotals


class ClinicalAlertsRequest(BaseModel):
    daily_totals: NutrientTotals
    conditions: list[Literal["diabetes", "hypertension", "renal", "dyslipidemia"]] = Field(default_factory=list)
    sodium_limit_mg: Decimal = Field(default=Decimal("2000"), gt=0)
    fiber_min_g: Decimal = Field(default=Decimal("25"), gt=0)
    protein_max_g: Decimal | None = Field(default=None, gt=0)


class ClinicalAlertRead(BaseModel):
    code: str
    severity: Literal["info", "warning", "critical"]
    message: str


class ClinicalAlertsRead(BaseModel):
    alerts: list[ClinicalAlertRead]
