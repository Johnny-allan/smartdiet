from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.patients.repository import PatientRepository
from app.patients.schemas import PatientCreate, PatientRead, PatientUpdate
from app.patients.service import PatientService
from app.shared.responses import ApiResponse

router = APIRouter(prefix="/patients", tags=["patients"])


def get_patient_service(db: Session = Depends(get_db)) -> PatientService:
    return PatientService(PatientRepository(db))


@router.get("", response_model=ApiResponse[list[PatientRead]])
def list_patients(service: PatientService = Depends(get_patient_service)) -> ApiResponse[list[PatientRead]]:
    return ApiResponse(data=service.list_patients())


@router.post("", response_model=ApiResponse[PatientRead], status_code=status.HTTP_201_CREATED)
def create_patient(
    payload: PatientCreate, service: PatientService = Depends(get_patient_service)
) -> ApiResponse[PatientRead]:
    return ApiResponse(data=service.create_patient(payload))


@router.get("/{patient_id}", response_model=ApiResponse[PatientRead])
def get_patient(patient_id: int, service: PatientService = Depends(get_patient_service)) -> ApiResponse[PatientRead]:
    return ApiResponse(data=service.get_patient(patient_id))


@router.put("/{patient_id}", response_model=ApiResponse[PatientRead])
def update_patient(
    patient_id: int,
    payload: PatientUpdate,
    service: PatientService = Depends(get_patient_service),
) -> ApiResponse[PatientRead]:
    return ApiResponse(data=service.update_patient(patient_id, payload))


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: int, service: PatientService = Depends(get_patient_service)) -> None:
    service.delete_patient(patient_id)
