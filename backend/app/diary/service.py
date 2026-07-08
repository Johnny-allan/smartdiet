from app.core.exceptions import NotFoundError
from app.diary.models import FoodDiaryEntry
from app.diary.repository import DiaryRepository
from app.diary.schemas import FoodDiaryEntryCreate, FoodDiaryEntryUpdate
from app.patients.repository import PatientRepository


class DiaryService:
    def __init__(self, repository: DiaryRepository, patients: PatientRepository) -> None:
        self.repository = repository
        self.patients = patients

    def _ensure_patient(self, patient_id: int) -> None:
        if self.patients.get(patient_id) is None:
            raise NotFoundError("Patient not found")

    def list_by_patient(self, patient_id: int) -> list[FoodDiaryEntry]:
        self._ensure_patient(patient_id)
        return self.repository.list_by_patient(patient_id)

    def create(self, patient_id: int, data: FoodDiaryEntryCreate) -> FoodDiaryEntry:
        self._ensure_patient(patient_id)
        return self.repository.create(patient_id, data)

    def update(self, patient_id: int, entry_id: int, data: FoodDiaryEntryUpdate) -> FoodDiaryEntry:
        self._ensure_patient(patient_id)
        entry = self.repository.get(entry_id)
        if entry is None or entry.patient_id != patient_id:
            raise NotFoundError("Diary entry not found")
        return self.repository.update(entry, data)

    def delete(self, patient_id: int, entry_id: int) -> None:
        self._ensure_patient(patient_id)
        entry = self.repository.get(entry_id)
        if entry is None or entry.patient_id != patient_id:
            raise NotFoundError("Diary entry not found")
        self.repository.delete(entry)
