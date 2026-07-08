from app.clinical.models import Anamnesis, PatientGoal
from app.clinical.repository import AnamnesisRepository, PatientGoalRepository
from app.clinical.schemas import AnamnesisCreate, PatientGoalCreate, PatientGoalUpdate
from app.core.exceptions import NotFoundError
from app.patients.repository import PatientRepository


class AnamnesisService:
    def __init__(self, repository: AnamnesisRepository, patients: PatientRepository) -> None:
        self.repository = repository
        self.patients = patients

    def get_by_patient(self, patient_id: int) -> Anamnesis:
        anamnesis = self.repository.get_by_patient(patient_id)
        if anamnesis is None:
            raise NotFoundError("Anamnesis not found")
        return anamnesis

    def create_or_replace(self, patient_id: int, data: AnamnesisCreate) -> Anamnesis:
        if self.patients.get(patient_id) is None:
            raise NotFoundError("Patient not found")
        return self.repository.create_or_replace(patient_id, data)


class PatientGoalService:
    def __init__(self, repository: PatientGoalRepository, patients: PatientRepository) -> None:
        self.repository = repository
        self.patients = patients

    def _ensure_patient(self, patient_id: int) -> None:
        if self.patients.get(patient_id) is None:
            raise NotFoundError("Patient not found")

    def list_by_patient(self, patient_id: int) -> list[PatientGoal]:
        self._ensure_patient(patient_id)
        return self.repository.list_by_patient(patient_id)

    def replace_for_patient(self, patient_id: int, goals: list[PatientGoalCreate]) -> list[PatientGoal]:
        self._ensure_patient(patient_id)
        return self.repository.replace_for_patient(patient_id, goals)

    def update_goal(self, patient_id: int, goal_id: int, data: PatientGoalUpdate) -> PatientGoal:
        self._ensure_patient(patient_id)
        goal = self.repository.get(goal_id)
        if goal is None or goal.patient_id != patient_id:
            raise NotFoundError("Patient goal not found")
        return self.repository.update(goal, data)
