from fastapi import APIRouter

from app.nutrition_engine.schemas import (
    ClinicalAlertsRead,
    ClinicalAlertsRequest,
    EnergyTargetRead,
    EnergyTargetRequest,
    EquivalentSubstitutionRead,
    EquivalentSubstitutionRequest,
    MacroTargetRead,
    MacroTargetRequest,
    MealPlanAnalyzeRead,
    MealPlanAnalyzeRequest,
)
from app.nutrition_engine.service import (
    analyze_meal_plan,
    calculate_clinical_alerts,
    calculate_energy_target,
    calculate_equivalent_substitution,
    calculate_macro_targets,
)
from app.shared.responses import ApiResponse

router = APIRouter(prefix="/nutrition", tags=["nutrition-engine"])


@router.post("/energy-target", response_model=ApiResponse[EnergyTargetRead])
def energy_target(payload: EnergyTargetRequest) -> ApiResponse[EnergyTargetRead]:
    return ApiResponse(data=calculate_energy_target(payload))


@router.post("/macro-targets", response_model=ApiResponse[MacroTargetRead])
def macro_targets(payload: MacroTargetRequest) -> ApiResponse[MacroTargetRead]:
    return ApiResponse(data=calculate_macro_targets(payload))


@router.post("/meal-plan/analyze", response_model=ApiResponse[MealPlanAnalyzeRead])
def meal_plan_analyze(payload: MealPlanAnalyzeRequest) -> ApiResponse[MealPlanAnalyzeRead]:
    return ApiResponse(data=analyze_meal_plan(payload))


@router.post("/substitutions/equivalent", response_model=ApiResponse[EquivalentSubstitutionRead])
def equivalent_substitution(payload: EquivalentSubstitutionRequest) -> ApiResponse[EquivalentSubstitutionRead]:
    return ApiResponse(data=calculate_equivalent_substitution(payload))


@router.post("/clinical-alerts", response_model=ApiResponse[ClinicalAlertsRead])
def clinical_alerts(payload: ClinicalAlertsRequest) -> ApiResponse[ClinicalAlertsRead]:
    return ApiResponse(data=calculate_clinical_alerts(payload))
