from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.core.exceptions import BusinessRuleError
from app.diary.schemas import FoodDiaryEntryCreate
from app.diary.service import DiaryService


class FakePatients:
    def get(self, patient_id: int) -> object:
        return object()


class FakeRecipes:
    def get(self, recipe_id: int) -> object:
        return type("Recipe", (), {"patient_id": 1})()


class FakeDiary:
    def create(self, patient_id: int, data: FoodDiaryEntryCreate) -> object:
        return object()


def test_diary_entry_accepts_textual_note_for_local_catalog() -> None:
    entry = FoodDiaryEntryCreate(
        date="2026-07-07",
        meal_type="Almoco",
        quantity=Decimal("1"),
        grams=Decimal("100"),
        notes="Registro textual do paciente",
    )

    assert entry.food_id is None
    assert entry.notes == "Registro textual do paciente"


def test_diary_entry_requires_reference_or_textual_note() -> None:
    with pytest.raises(ValidationError):
        FoodDiaryEntryCreate(date="2026-07-07", meal_type="Almoco", quantity=Decimal("1"), grams=Decimal("100"))


def test_diary_rejects_recipe_from_another_patient() -> None:
    service = DiaryService(FakeDiary(), FakePatients(), FakeRecipes())  # type: ignore[arg-type]
    entry = FoodDiaryEntryCreate(
        date="2026-07-07",
        meal_type="Almoco",
        recipe_id=10,
        quantity=Decimal("1"),
        grams=Decimal("100"),
    )

    with pytest.raises(BusinessRuleError, match="belong"):
        service.create(2, entry)
