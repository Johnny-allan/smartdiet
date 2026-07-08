from app.core.exceptions import NotFoundError
from app.patients.models import Patient
from app.patients.repository import PatientRepository
from app.patients.schemas import PatientCreate, PatientUpdate


class PatientService:
    def __init__(self, repository: PatientRepository) -> None:
        self.repository = repository

    def list_patients(self) -> list[Patient]:
        return self.repository.list()

    def get_patient(self, patient_id: int) -> Patient:
        patient = self.repository.get(patient_id)
        if patient is None:
            raise NotFoundError("Patient not found")
        return patient

    def create_patient(self, data: PatientCreate) -> Patient:
        return self.repository.create(data)

    def update_patient(self, patient_id: int, data: PatientUpdate) -> Patient:
        return self.repository.update(self.get_patient(patient_id), data)

    def delete_patient(self, patient_id: int) -> None:
        self.repository.delete(self.get_patient(patient_id))
