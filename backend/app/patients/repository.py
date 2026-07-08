from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.patients.models import Patient
from app.patients.schemas import PatientCreate, PatientUpdate


class PatientRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Patient]:
        return list(self.db.scalars(select(Patient).order_by(Patient.full_name)))

    def get(self, patient_id: int) -> Patient | None:
        return self.db.get(Patient, patient_id)

    def create(self, data: PatientCreate) -> Patient:
        patient = Patient(**data.model_dump())
        self.db.add(patient)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def update(self, patient: Patient, data: PatientUpdate) -> Patient:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(patient, field, value)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def delete(self, patient: Patient) -> None:
        self.db.delete(patient)
        self.db.commit()
