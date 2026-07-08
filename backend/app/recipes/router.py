from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.recipes.repository import RecipeRepository
from app.recipes.schemas import RecipeCalculation, RecipeCreate, RecipeRead, RecipeUpdate
from app.recipes.service import RecipeService
from app.shared.responses import ApiResponse

router = APIRouter(prefix="/recipes", tags=["recipes"])


def get_recipe_service(db: Session = Depends(get_db)) -> RecipeService:
    return RecipeService(RecipeRepository(db))


@router.get("", response_model=ApiResponse[list[RecipeRead]])
def list_recipes(service: RecipeService = Depends(get_recipe_service)) -> ApiResponse[list[RecipeRead]]:
    return ApiResponse(data=service.list_recipes())


@router.post("", response_model=ApiResponse[RecipeRead], status_code=status.HTTP_201_CREATED)
def create_recipe(
    payload: RecipeCreate, service: RecipeService = Depends(get_recipe_service)
) -> ApiResponse[RecipeRead]:
    return ApiResponse(data=service.create_recipe(payload))


@router.get("/{recipe_id}", response_model=ApiResponse[RecipeRead])
def get_recipe(recipe_id: int, service: RecipeService = Depends(get_recipe_service)) -> ApiResponse[RecipeRead]:
    return ApiResponse(data=service.get_recipe(recipe_id))


@router.put("/{recipe_id}", response_model=ApiResponse[RecipeRead])
def update_recipe(
    recipe_id: int,
    payload: RecipeUpdate,
    service: RecipeService = Depends(get_recipe_service),
) -> ApiResponse[RecipeRead]:
    return ApiResponse(data=service.update_recipe(recipe_id, payload))


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(recipe_id: int, service: RecipeService = Depends(get_recipe_service)) -> None:
    service.delete_recipe(recipe_id)


@router.post("/{recipe_id}/calculate", response_model=ApiResponse[RecipeCalculation])
def calculate_recipe(
    recipe_id: int, service: RecipeService = Depends(get_recipe_service)
) -> ApiResponse[RecipeCalculation]:
    return ApiResponse(data=service.calculate_recipe(recipe_id))
