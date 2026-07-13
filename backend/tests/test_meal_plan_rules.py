from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.core.exceptions import BusinessRuleError
from app.plans.schemas import MealPlanCreate, MealPlanItemCreate, MealPlanMealCreate
from app.plans.service import MealPlanService


class FakePatients:
    def get(self, patient_id: int) -> object:
        return object()


class FakeMealPlanRepository:
    def create(self, patient_id: int, data: MealPlanCreate) -> object:
        return object()


class FakeRecipes:
    def get(self, recipe_id: int) -> object:
        return type("Recipe", (), {"patient_id": 1})()


def test_meal_plan_requires_six_standard_meals() -> None:
    service = MealPlanService(FakeMealPlanRepository(), FakePatients(), FakeRecipes())  # type: ignore[arg-type]
    payload = MealPlanCreate(title="Plano teste", meals=[MealPlanMealCreate(meal_type="Almoco")])

    with pytest.raises(BusinessRuleError):
        service.create_plan(1, payload)


def test_meal_plan_accepts_required_meals() -> None:
    service = MealPlanService(FakeMealPlanRepository(), FakePatients(), FakeRecipes())  # type: ignore[arg-type]
    payload = MealPlanCreate(
        title="Plano teste",
        meals=[
            MealPlanMealCreate(meal_type="Cafe da manha"),
            MealPlanMealCreate(meal_type="Lanche da manha"),
            MealPlanMealCreate(meal_type="Almoco"),
            MealPlanMealCreate(meal_type="Lanche da tarde"),
            MealPlanMealCreate(meal_type="Jantar"),
            MealPlanMealCreate(meal_type="Ceia"),
        ],
    )

    assert service.create_plan(1, payload) is not None


def test_meal_plan_item_accepts_textual_food_note_for_local_catalog() -> None:
    item = MealPlanItemCreate(quantity=Decimal("1"), unit="g", grams=Decimal("100"), notes="Arroz cozido")

    assert item.food_id is None
    assert item.notes == "Arroz cozido"


def test_meal_plan_item_requires_reference_or_textual_note() -> None:
    with pytest.raises(ValidationError):
        MealPlanItemCreate(quantity=Decimal("1"), unit="g", grams=Decimal("100"))


def test_meal_plan_rejects_recipe_from_another_patient() -> None:
    service = MealPlanService(FakeMealPlanRepository(), FakePatients(), FakeRecipes())  # type: ignore[arg-type]
    meals = [
        MealPlanMealCreate(
            meal_type=meal,
            items=[MealPlanItemCreate(recipe_id=10, quantity=Decimal("1"), unit="porcao", grams=Decimal("100"))],
        )
        for meal in ["Cafe da manha", "Lanche da manha", "Almoco", "Lanche da tarde", "Jantar", "Ceia"]
    ]

    with pytest.raises(BusinessRuleError, match="belong"):
        service.create_plan(2, MealPlanCreate(title="Plano cruzado", meals=meals))
