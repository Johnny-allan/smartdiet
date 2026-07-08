from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.assessment.models import Bioimpedance, PhysicalAssessment
from app.assessment.schemas import BioimpedanceUpdate, PhysicalAssessmentUpdate


class AssessmentRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_physical(self, patient_id: int) -> list[PhysicalAssessment]:
        return list(
            self.db.scalars(
                select(PhysicalAssessment)
                .where(PhysicalAssessment.patient_id == patient_id)
                .order_by(PhysicalAssessment.date.desc())
            )
        )

    def create_physical(self, assessment: PhysicalAssessment) -> PhysicalAssessment:
        self.db.add(assessment)
        self.db.commit()
        self.db.refresh(assessment)
        return assessment

    def get_physical(self, assessment_id: int) -> PhysicalAssessment | None:
        return self.db.get(PhysicalAssessment, assessment_id)

    def update_physical(
        self, assessment: PhysicalAssessment, data: PhysicalAssessmentUpdate, bmi: Decimal
    ) -> PhysicalAssessment:
        for field, value in data.model_dump().items():
            setattr(assessment, field, value)
        assessment.bmi = bmi
        self.db.commit()
        self.db.refresh(assessment)
        return assessment

    def delete_physical(self, assessment: PhysicalAssessment) -> None:
        self.db.delete(assessment)
        self.db.commit()

    def list_bioimpedance(self, patient_id: int) -> list[Bioimpedance]:
        return list(
            self.db.scalars(
                select(Bioimpedance)
                .where(Bioimpedance.patient_id == patient_id)
                .order_by(Bioimpedance.date.desc())
            )
        )

    def create_bioimpedance(self, bioimpedance: Bioimpedance) -> Bioimpedance:
        self.db.add(bioimpedance)
        self.db.commit()
        self.db.refresh(bioimpedance)
        return bioimpedance

    def get_bioimpedance(self, bioimpedance_id: int) -> Bioimpedance | None:
        return self.db.get(Bioimpedance, bioimpedance_id)

    def update_bioimpedance(self, bioimpedance: Bioimpedance, data: BioimpedanceUpdate) -> Bioimpedance:
        for field, value in data.model_dump().items():
            setattr(bioimpedance, field, value)
        self.db.commit()
        self.db.refresh(bioimpedance)
        return bioimpedance

    def delete_bioimpedance(self, bioimpedance: Bioimpedance) -> None:
        self.db.delete(bioimpedance)
        self.db.commit()
