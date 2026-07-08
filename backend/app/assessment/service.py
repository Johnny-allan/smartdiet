from app.assessment.models import Bioimpedance, PhysicalAssessment
from app.assessment.repository import AssessmentRepository
from app.assessment.schemas import (
    BioimpedanceCreate,
    BioimpedanceUpdate,
    PhysicalAssessmentCreate,
    PhysicalAssessmentUpdate,
)
from app.core.exceptions import BusinessRuleError, NotFoundError
from app.patients.repository import PatientRepository
from app.shared.nutrition import calculate_bmi


class AssessmentService:
    def __init__(self, repository: AssessmentRepository, patients: PatientRepository) -> None:
        self.repository = repository
        self.patients = patients

    def _ensure_patient(self, patient_id: int) -> None:
        if self.patients.get(patient_id) is None:
            raise NotFoundError("Patient not found")

    def list_physical(self, patient_id: int) -> list[PhysicalAssessment]:
        self._ensure_patient(patient_id)
        return self.repository.list_physical(patient_id)

    def create_physical(self, patient_id: int, data: PhysicalAssessmentCreate) -> PhysicalAssessment:
        self._ensure_patient(patient_id)
        try:
            bmi = calculate_bmi(data.weight_kg, data.height_cm)
        except ValueError as exc:
            raise BusinessRuleError(str(exc)) from exc
        return self.repository.create_physical(
            PhysicalAssessment(patient_id=patient_id, bmi=bmi, **data.model_dump())
        )

    def update_physical(
        self, patient_id: int, assessment_id: int, data: PhysicalAssessmentUpdate
    ) -> PhysicalAssessment:
        self._ensure_patient(patient_id)
        assessment = self.repository.get_physical(assessment_id)
        if assessment is None or assessment.patient_id != patient_id:
            raise NotFoundError("Physical assessment not found")
        try:
            bmi = calculate_bmi(data.weight_kg, data.height_cm)
        except ValueError as exc:
            raise BusinessRuleError(str(exc)) from exc
        return self.repository.update_physical(assessment, data, bmi)

    def delete_physical(self, patient_id: int, assessment_id: int) -> None:
        self._ensure_patient(patient_id)
        assessment = self.repository.get_physical(assessment_id)
        if assessment is None or assessment.patient_id != patient_id:
            raise NotFoundError("Physical assessment not found")
        self.repository.delete_physical(assessment)

    def list_bioimpedance(self, patient_id: int) -> list[Bioimpedance]:
        self._ensure_patient(patient_id)
        return self.repository.list_bioimpedance(patient_id)

    def create_bioimpedance(self, patient_id: int, data: BioimpedanceCreate) -> Bioimpedance:
        self._ensure_patient(patient_id)
        return self.repository.create_bioimpedance(Bioimpedance(patient_id=patient_id, **data.model_dump()))

    def update_bioimpedance(
        self, patient_id: int, bioimpedance_id: int, data: BioimpedanceUpdate
    ) -> Bioimpedance:
        self._ensure_patient(patient_id)
        bioimpedance = self.repository.get_bioimpedance(bioimpedance_id)
        if bioimpedance is None or bioimpedance.patient_id != patient_id:
            raise NotFoundError("Bioimpedance not found")
        return self.repository.update_bioimpedance(bioimpedance, data)

    def delete_bioimpedance(self, patient_id: int, bioimpedance_id: int) -> None:
        self._ensure_patient(patient_id)
        bioimpedance = self.repository.get_bioimpedance(bioimpedance_id)
        if bioimpedance is None or bioimpedance.patient_id != patient_id:
            raise NotFoundError("Bioimpedance not found")
        self.repository.delete_bioimpedance(bioimpedance)
