from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.foods.repository import FoodRepository
from app.foods.schemas import FoodCreate, FoodNutrientRead, FoodRead, FoodSummaryRead, TacoFoodRead
from app.foods.service import FoodService
from app.foods.brazilian_tables import list_brazilian_foods as list_brazilian_tables
from app.foods.brazilian_tables import search_brazilian_foods as search_brazilian_tables
from app.shared.responses import ApiResponse

router = APIRouter(prefix="/foods", tags=["foods"])


def get_food_service(db: Session = Depends(get_db)) -> FoodService:
    return FoodService(FoodRepository(db))


@router.get("", response_model=ApiResponse[list[FoodSummaryRead]])
def list_foods(service: FoodService = Depends(get_food_service)) -> ApiResponse[list[FoodSummaryRead]]:
    return ApiResponse(data=service.list_foods())


@router.post("", response_model=ApiResponse[FoodSummaryRead], status_code=status.HTTP_201_CREATED)
def create_food(payload: FoodCreate, service: FoodService = Depends(get_food_service)) -> ApiResponse[FoodSummaryRead]:
    return ApiResponse(data=service.create_food(payload))


@router.get("/search", response_model=ApiResponse[list[FoodSummaryRead]])
def search_foods(
    q: str = Query(min_length=1), service: FoodService = Depends(get_food_service)
) -> ApiResponse[list[FoodSummaryRead]]:
    return ApiResponse(data=service.search_foods(q))


@router.get("/brazilian", response_model=ApiResponse[list[TacoFoodRead]])
def list_brazilian_foods(limit: int = Query(default=100, ge=1, le=7000)) -> ApiResponse[list[TacoFoodRead]]:
    return ApiResponse(data=list_brazilian_tables(limit))


@router.get("/brazilian/search", response_model=ApiResponse[list[TacoFoodRead]])
def search_brazilian_foods(
    q: str = Query(min_length=1), limit: int = Query(default=30, ge=1, le=100)
) -> ApiResponse[list[TacoFoodRead]]:
    return ApiResponse(data=search_brazilian_tables(q, limit))


@router.get("/{food_id}", response_model=ApiResponse[FoodRead])
def get_food(food_id: int, service: FoodService = Depends(get_food_service)) -> ApiResponse[FoodRead]:
    return ApiResponse(data=service.get_food(food_id))


@router.get("/{food_id}/nutrients", response_model=ApiResponse[list[FoodNutrientRead]])
def get_food_nutrients(
    food_id: int, service: FoodService = Depends(get_food_service)
) -> ApiResponse[list[FoodNutrientRead]]:
    return ApiResponse(data=service.get_nutrients(food_id))
