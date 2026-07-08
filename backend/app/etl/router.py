from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.etl.repository import ImportJobRepository
from app.etl.schemas import FoodImportResult, OpenFoodFactsImportRequest
from app.etl.service import OpenFoodFactsImportService
from app.foods.repository import FoodRepository
from app.shared.responses import ApiResponse

router = APIRouter(prefix="/etl", tags=["etl"])


def get_open_food_facts_import_service(db: Session = Depends(get_db)) -> OpenFoodFactsImportService:
    return OpenFoodFactsImportService(FoodRepository(db), ImportJobRepository(db))


@router.post(
    "/open-food-facts/import",
    response_model=ApiResponse[FoodImportResult],
    status_code=status.HTTP_201_CREATED,
)
def import_open_food_facts(
    payload: OpenFoodFactsImportRequest,
    service: OpenFoodFactsImportService = Depends(get_open_food_facts_import_service),
) -> ApiResponse[FoodImportResult]:
    return ApiResponse(data=service.import_by_search(payload.query, payload.page_size, payload.country))
