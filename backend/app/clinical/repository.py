from sqlalchemy import select
from sqlalchemy.orm import Session

from app.clinical.models import Anamnesis, PatientGoal
from app.clinical.schemas import AnamnesisCreate, PatientGoalCreate, PatientGoalUpdate


class AnamnesisRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_patient(self, patient_id: int) -> Anamnesis | None:
        return self.db.scalar(select(Anamnesis).where(Anamnesis.patient_id == patient_id))

    def create_or_replace(self, patient_id: int, data: AnamnesisCreate) -> Anamnesis:
        anamnesis = self.get_by_patient(patient_id)
        if anamnesis is None:
            anamnesis = Anamnesis(patient_id=patient_id, **data.model_dump())
            self.db.add(anamnesis)
        else:
            for field, value in data.model_dump().items():
                setattr(anamnesis, field, value)
        self.db.commit()
        self.db.refresh(anamnesis)
        return anamnesis


class PatientGoalRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_by_patient(self, patient_id: int) -> list[PatientGoal]:
        return list(
            self.db.scalars(
                select(PatientGoal).where(PatientGoal.patient_id == patient_id).order_by(PatientGoal.id.desc())
            )
        )

    def get(self, goal_id: int) -> PatientGoal | None:
        return self.db.get(PatientGoal, goal_id)

    def replace_for_patient(self, patient_id: int, goals: list[PatientGoalCreate]) -> list[PatientGoal]:
        existing = self.list_by_patient(patient_id)
        for goal in existing:
            self.db.delete(goal)
        self.db.flush()
        created = [PatientGoal(patient_id=patient_id, **goal.model_dump()) for goal in goals]
        self.db.add_all(created)
        self.db.commit()
        return self.list_by_patient(patient_id)

    def update(self, goal: PatientGoal, data: PatientGoalUpdate) -> PatientGoal:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(goal, field, value)
        self.db.commit()
        self.db.refresh(goal)
        return goal
