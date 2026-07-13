from types import SimpleNamespace

import pytest

from app.core.exceptions import NotFoundError
from app.recipes.service import RecipeService


class FakePatients:
    def get(self, patient_id: int) -> object | None:
        return object() if patient_id in {1, 2} else None


class FakeRecipes:
    def __init__(self) -> None:
        self.recipes = {
            10: SimpleNamespace(id=10, patient_id=1, title="Receita paciente 1"),
            20: SimpleNamespace(id=20, patient_id=2, title="Receita paciente 2"),
        }

    def get(self, recipe_id: int) -> object | None:
        return self.recipes.get(recipe_id)

    def list_by_patient(self, patient_id: int) -> list[object]:
        return [recipe for recipe in self.recipes.values() if recipe.patient_id == patient_id]


def test_recipe_list_is_scoped_to_patient() -> None:
    service = RecipeService(FakeRecipes(), FakePatients())  # type: ignore[arg-type]

    assert [recipe.id for recipe in service.list_recipes(1)] == [10]
    assert [recipe.id for recipe in service.list_recipes(2)] == [20]


def test_recipe_cannot_be_read_through_another_patient() -> None:
    service = RecipeService(FakeRecipes(), FakePatients())  # type: ignore[arg-type]

    with pytest.raises(NotFoundError):
        service.get_recipe(2, 10)
