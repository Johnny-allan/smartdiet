from decimal import Decimal

import pytest

from app.shared.nutrition import calculate_bmi, normalize_text, scale_per_100g


def test_calculate_bmi() -> None:
    assert calculate_bmi(Decimal("70"), Decimal("175")) == Decimal("22.86")


def test_calculate_bmi_rejects_invalid_values() -> None:
    with pytest.raises(ValueError):
        calculate_bmi(Decimal("70"), Decimal("0"))


def test_scale_per_100g() -> None:
    assert scale_per_100g(Decimal("20"), Decimal("50")) == Decimal("10.00")


def test_normalize_text_removes_accents_and_extra_spaces() -> None:
    assert normalize_text("  Café   da Manhã  ") == "cafe da manha"
