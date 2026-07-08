from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.clinical.repository import AnamnesisRepository, PatientGoalRepository
from app.clinical.schemas import AnamnesisCreate, AnamnesisRead, PatientGoalCreate, PatientGoalRead, PatientGoalUpdate
from app.clinical.service import AnamnesisService, PatientGoalService
from app.core.database import get_db
from app.patients.repository import PatientRepository
from app.shared.responses import ApiResponse

router = APIRouter(prefix="/patients/{patient_id}/anamnesis", tags=["anamnesis"])
goals_router = APIRouter(prefix="/patients/{patient_id}/goals", tags=["patient-goals"])


def get_anamnesis_service(db: Session = Depends(get_db)) -> AnamnesisService:
    return AnamnesisService(AnamnesisRepository(db), PatientRepository(db))


def get_goal_service(db: Session = Depends(get_db)) -> PatientGoalService:
    return PatientGoalService(PatientGoalRepository(db), PatientRepository(db))


@router.get("", response_model=ApiResponse[AnamnesisRead])
def get_anamnesis(
    patient_id: int, service: AnamnesisService = Depends(get_anamnesis_service)
) -> ApiResponse[AnamnesisRead]:
    return ApiResponse(data=service.get_by_patient(patient_id))


@router.post("", response_model=ApiResponse[AnamnesisRead], status_code=status.HTTP_201_CREATED)
def create_anamnesis(
    patient_id: int,
    payload: AnamnesisCreate,
    service: AnamnesisService = Depends(get_anamnesis_service),
) -> ApiResponse[AnamnesisRead]:
    return ApiResponse(data=service.create_or_replace(patient_id, payload))


@goals_router.get("", response_model=ApiResponse[list[PatientGoalRead]])
def list_patient_goals(
    patient_id: int, service: PatientGoalService = Depends(get_goal_service)
) -> ApiResponse[list[PatientGoalRead]]:
    return ApiResponse(data=service.list_by_patient(patient_id))


@goals_router.put("", response_model=ApiResponse[list[PatientGoalRead]])
def replace_patient_goals(
    patient_id: int,
    payload: list[PatientGoalCreate],
    service: PatientGoalService = Depends(get_goal_service),
) -> ApiResponse[list[PatientGoalRead]]:
    return ApiResponse(data=service.replace_for_patient(patient_id, payload))


@goals_router.patch("/{goal_id}", response_model=ApiResponse[PatientGoalRead])
def update_patient_goal(
    patient_id: int,
    goal_id: int,
    payload: PatientGoalUpdate,
    service: PatientGoalService = Depends(get_goal_service),
) -> ApiResponse[PatientGoalRead]:
    return ApiResponse(data=service.update_goal(patient_id, goal_id, payload))
