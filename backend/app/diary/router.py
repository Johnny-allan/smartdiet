from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.diary.repository import DiaryRepository
from app.diary.schemas import FoodDiaryEntryCreate, FoodDiaryEntryRead, FoodDiaryEntryUpdate
from app.diary.service import DiaryService
from app.patients.repository import PatientRepository
from app.recipes.repository import RecipeRepository
from app.shared.responses import ApiResponse

router = APIRouter(prefix="/patients/{patient_id}/diary", tags=["diary"])


def get_diary_service(db: Session = Depends(get_db)) -> DiaryService:
    return DiaryService(DiaryRepository(db), PatientRepository(db), RecipeRepository(db))


@router.get("", response_model=ApiResponse[list[FoodDiaryEntryRead]])
def list_diary(
    patient_id: int, service: DiaryService = Depends(get_diary_service)
) -> ApiResponse[list[FoodDiaryEntryRead]]:
    return ApiResponse(data=service.list_by_patient(patient_id))


@router.post("", response_model=ApiResponse[FoodDiaryEntryRead], status_code=status.HTTP_201_CREATED)
def create_diary_entry(
    patient_id: int,
    payload: FoodDiaryEntryCreate,
    service: DiaryService = Depends(get_diary_service),
) -> ApiResponse[FoodDiaryEntryRead]:
    return ApiResponse(data=service.create(patient_id, payload))


@router.put("/{entry_id}", response_model=ApiResponse[FoodDiaryEntryRead])
def update_diary_entry(
    patient_id: int,
    entry_id: int,
    payload: FoodDiaryEntryUpdate,
    service: DiaryService = Depends(get_diary_service),
) -> ApiResponse[FoodDiaryEntryRead]:
    return ApiResponse(data=service.update(patient_id, entry_id, payload))


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_diary_entry(
    patient_id: int,
    entry_id: int,
    service: DiaryService = Depends(get_diary_service),
) -> None:
    service.delete(patient_id, entry_id)
