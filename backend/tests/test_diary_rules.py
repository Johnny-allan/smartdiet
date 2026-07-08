from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.diary.schemas import FoodDiaryEntryCreate


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
