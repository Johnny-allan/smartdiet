from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.patients.repository import PatientRepository
from app.plans.repository import MealPlanRepository
from app.plans.schemas import MealPlanCreate, MealPlanRead
from app.plans.service import MealPlanService
from app.recipes.repository import RecipeRepository
from app.shared.responses import ApiResponse

router = APIRouter(tags=["meal-plans"])


def get_meal_plan_service(db: Session = Depends(get_db)) -> MealPlanService:
    return MealPlanService(MealPlanRepository(db), PatientRepository(db), RecipeRepository(db))


@router.get("/patients/{patient_id}/meal-plans", response_model=ApiResponse[list[MealPlanRead]])
def list_patient_plans(
    patient_id: int, service: MealPlanService = Depends(get_meal_plan_service)
) -> ApiResponse[list[MealPlanRead]]:
    return ApiResponse(data=service.list_by_patient(patient_id))


@router.post(
    "/patients/{patient_id}/meal-plans",
    response_model=ApiResponse[MealPlanRead],
    status_code=status.HTTP_201_CREATED,
)
def create_patient_plan(
    patient_id: int,
    payload: MealPlanCreate,
    service: MealPlanService = Depends(get_meal_plan_service),
) -> ApiResponse[MealPlanRead]:
    return ApiResponse(data=service.create_plan(patient_id, payload))


@router.get("/meal-plans/{plan_id}", response_model=ApiResponse[MealPlanRead])
def get_plan(plan_id: int, service: MealPlanService = Depends(get_meal_plan_service)) -> ApiResponse[MealPlanRead]:
    return ApiResponse(data=service.get_plan(plan_id))
