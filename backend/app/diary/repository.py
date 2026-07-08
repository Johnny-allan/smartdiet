from sqlalchemy import select
from sqlalchemy.orm import Session

from app.diary.models import FoodDiaryEntry
from app.diary.schemas import FoodDiaryEntryCreate, FoodDiaryEntryUpdate


class DiaryRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_by_patient(self, patient_id: int) -> list[FoodDiaryEntry]:
        return list(
            self.db.scalars(
                select(FoodDiaryEntry).where(FoodDiaryEntry.patient_id == patient_id).order_by(FoodDiaryEntry.date.desc())
            )
        )

    def create(self, patient_id: int, data: FoodDiaryEntryCreate) -> FoodDiaryEntry:
        entry = FoodDiaryEntry(patient_id=patient_id, **data.model_dump())
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def get(self, entry_id: int) -> FoodDiaryEntry | None:
        return self.db.get(FoodDiaryEntry, entry_id)

    def update(self, entry: FoodDiaryEntry, data: FoodDiaryEntryUpdate) -> FoodDiaryEntry:
        for field, value in data.model_dump().items():
            setattr(entry, field, value)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def delete(self, entry: FoodDiaryEntry) -> None:
        self.db.delete(entry)
        self.db.commit()
