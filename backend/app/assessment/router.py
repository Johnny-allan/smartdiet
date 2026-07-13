from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.assessment.repository import AssessmentRepository
from app.assessment.schemas import (
    BioimpedanceCreate,
    BioimpedanceRead,
    BioimpedanceUpdate,
    CompleteAssessmentCreate,
    CompleteAssessmentRead,
    PhysicalAssessmentCreate,
    PhysicalAssessmentRead,
    PhysicalAssessmentUpdate,
)
from app.assessment.service import AssessmentService
from app.core.database import get_db
from app.patients.repository import PatientRepository
from app.shared.responses import ApiResponse

router = APIRouter(prefix="/patients/{patient_id}", tags=["assessments"])


def get_assessment_service(db: Session = Depends(get_db)) -> AssessmentService:
    return AssessmentService(AssessmentRepository(db), PatientRepository(db))


@router.get("/assessments", response_model=ApiResponse[list[PhysicalAssessmentRead]])
def list_assessments(
    patient_id: int, service: AssessmentService = Depends(get_assessment_service)
) -> ApiResponse[list[PhysicalAssessmentRead]]:
    return ApiResponse(data=service.list_physical(patient_id))


@router.post("/assessments", response_model=ApiResponse[PhysicalAssessmentRead], status_code=status.HTTP_201_CREATED)
def create_assessment(
    patient_id: int,
    payload: PhysicalAssessmentCreate,
    service: AssessmentService = Depends(get_assessment_service),
) -> ApiResponse[PhysicalAssessmentRead]:
    return ApiResponse(data=service.create_physical(patient_id, payload))


@router.post(
    "/assessments/complete",
    response_model=ApiResponse[CompleteAssessmentRead],
    status_code=status.HTTP_201_CREATED,
)
def create_complete_assessment(
    patient_id: int,
    payload: CompleteAssessmentCreate,
    service: AssessmentService = Depends(get_assessment_service),
) -> ApiResponse[CompleteAssessmentRead]:
    physical, bioimpedance = service.create_complete(patient_id, payload)
    return ApiResponse(
        data=CompleteAssessmentRead(physical=physical, bioimpedance=bioimpedance)
    )


@router.put("/assessments/{assessment_id}", response_model=ApiResponse[PhysicalAssessmentRead])
def update_assessment(
    patient_id: int,
    assessment_id: int,
    payload: PhysicalAssessmentUpdate,
    service: AssessmentService = Depends(get_assessment_service),
) -> ApiResponse[PhysicalAssessmentRead]:
    return ApiResponse(data=service.update_physical(patient_id, assessment_id, payload))


@router.delete("/assessments/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assessment(
    patient_id: int,
    assessment_id: int,
    service: AssessmentService = Depends(get_assessment_service),
) -> None:
    service.delete_physical(patient_id, assessment_id)


@router.get("/bioimpedance", response_model=ApiResponse[list[BioimpedanceRead]])
def list_bioimpedance(
    patient_id: int, service: AssessmentService = Depends(get_assessment_service)
) -> ApiResponse[list[BioimpedanceRead]]:
    return ApiResponse(data=service.list_bioimpedance(patient_id))


@router.post("/bioimpedance", response_model=ApiResponse[BioimpedanceRead], status_code=status.HTTP_201_CREATED)
def create_bioimpedance(
    patient_id: int,
    payload: BioimpedanceCreate,
    service: AssessmentService = Depends(get_assessment_service),
) -> ApiResponse[BioimpedanceRead]:
    return ApiResponse(data=service.create_bioimpedance(patient_id, payload))


@router.put("/bioimpedance/{bioimpedance_id}", response_model=ApiResponse[BioimpedanceRead])
def update_bioimpedance(
    patient_id: int,
    bioimpedance_id: int,
    payload: BioimpedanceUpdate,
    service: AssessmentService = Depends(get_assessment_service),
) -> ApiResponse[BioimpedanceRead]:
    return ApiResponse(data=service.update_bioimpedance(patient_id, bioimpedance_id, payload))


@router.delete("/bioimpedance/{bioimpedance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bioimpedance(
    patient_id: int,
    bioimpedance_id: int,
    service: AssessmentService = Depends(get_assessment_service),
) -> None:
    service.delete_bioimpedance(patient_id, bioimpedance_id)
