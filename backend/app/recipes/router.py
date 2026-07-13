from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.patients.repository import PatientRepository
from app.recipes.repository import RecipeRepository
from app.recipes.schemas import RecipeCalculation, RecipeCreate, RecipeRead, RecipeUpdate
from app.recipes.service import RecipeService
from app.shared.responses import ApiResponse

router = APIRouter(prefix="/patients/{patient_id}/recipes", tags=["recipes"])


def get_recipe_service(db: Session = Depends(get_db)) -> RecipeService:
    return RecipeService(RecipeRepository(db), PatientRepository(db))


@router.get("", response_model=ApiResponse[list[RecipeRead]])
def list_recipes(
    patient_id: int, service: RecipeService = Depends(get_recipe_service)
) -> ApiResponse[list[RecipeRead]]:
    return ApiResponse(data=service.list_recipes(patient_id))


@router.post("", response_model=ApiResponse[RecipeRead], status_code=status.HTTP_201_CREATED)
def create_recipe(
    patient_id: int, payload: RecipeCreate, service: RecipeService = Depends(get_recipe_service)
) -> ApiResponse[RecipeRead]:
    return ApiResponse(data=service.create_recipe(patient_id, payload))


@router.get("/{recipe_id}", response_model=ApiResponse[RecipeRead])
def get_recipe(
    patient_id: int, recipe_id: int, service: RecipeService = Depends(get_recipe_service)
) -> ApiResponse[RecipeRead]:
    return ApiResponse(data=service.get_recipe(patient_id, recipe_id))


@router.put("/{recipe_id}", response_model=ApiResponse[RecipeRead])
def update_recipe(
    patient_id: int,
    recipe_id: int,
    payload: RecipeUpdate,
    service: RecipeService = Depends(get_recipe_service),
) -> ApiResponse[RecipeRead]:
    return ApiResponse(data=service.update_recipe(patient_id, recipe_id, payload))


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(
    patient_id: int, recipe_id: int, service: RecipeService = Depends(get_recipe_service)
) -> None:
    service.delete_recipe(patient_id, recipe_id)


@router.post("/{recipe_id}/calculate", response_model=ApiResponse[RecipeCalculation])
def calculate_recipe(
    patient_id: int, recipe_id: int, service: RecipeService = Depends(get_recipe_service)
) -> ApiResponse[RecipeCalculation]:
    return ApiResponse(data=service.calculate_recipe(patient_id, recipe_id))
