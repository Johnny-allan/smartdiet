from decimal import Decimal

from app.core.exceptions import BusinessRuleError, NotFoundError
from app.recipes.models import Recipe
from app.recipes.repository import RecipeRepository
from app.recipes.schemas import NutritionTotals, RecipeCalculation, RecipeCreate, RecipeUpdate
from app.patients.repository import PatientRepository
from app.shared.nutrition import round_decimal, scale_per_100g

NUTRIENT_CODE_MAP = {
    "energy_kcal": "kcal",
    "kcal": "kcal",
    "protein": "protein_g",
    "protein_g": "protein_g",
    "carbohydrate": "carbs_g",
    "carbs_g": "carbs_g",
    "fat": "fat_g",
    "fat_g": "fat_g",
    "fiber": "fiber_g",
    "fiber_g": "fiber_g",
    "sodium": "sodium_mg",
    "sodium_mg": "sodium_mg",
}


class RecipeService:
    def __init__(self, repository: RecipeRepository, patients: PatientRepository) -> None:
        self.repository = repository
        self.patients = patients

    def _ensure_patient(self, patient_id: int) -> None:
        if self.patients.get(patient_id) is None:
            raise NotFoundError("Patient not found")

    def list_recipes(self, patient_id: int) -> list[Recipe]:
        self._ensure_patient(patient_id)
        return self.repository.list_by_patient(patient_id)

    def get_recipe(self, patient_id: int, recipe_id: int) -> Recipe:
        self._ensure_patient(patient_id)
        recipe = self.repository.get(recipe_id)
        if recipe is None or recipe.patient_id != patient_id:
            raise NotFoundError("Recipe not found")
        return recipe

    def create_recipe(self, patient_id: int, data: RecipeCreate) -> Recipe:
        self._ensure_patient(patient_id)
        return self.repository.create(patient_id, data)

    def update_recipe(self, patient_id: int, recipe_id: int, data: RecipeUpdate) -> Recipe:
        recipe = self.get_recipe(patient_id, recipe_id)
        return self.repository.update(recipe, data)

    def delete_recipe(self, patient_id: int, recipe_id: int) -> None:
        recipe = self.get_recipe(patient_id, recipe_id)
        self.repository.delete(recipe)

    def calculate_recipe(self, patient_id: int, recipe_id: int) -> RecipeCalculation:
        recipe = self.get_recipe(patient_id, recipe_id)
        totals = NutritionTotals()

        for item in self.repository.items_for(recipe_id):
            for code, food_nutrient in self.repository.nutrients_for_food(item.food_id):
                field = NUTRIENT_CODE_MAP.get(code)
                if field is None:
                    continue
                current = getattr(totals, field)
                setattr(totals, field, current + scale_per_100g(food_nutrient.amount_per_100g, item.grams))

        if recipe.servings <= 0:
            raise BusinessRuleError("Recipe servings must be greater than zero")

        per_serving = NutritionTotals(
            kcal=round_decimal(totals.kcal / Decimal(recipe.servings)),
            protein_g=round_decimal(totals.protein_g / Decimal(recipe.servings)),
            carbs_g=round_decimal(totals.carbs_g / Decimal(recipe.servings)),
            fat_g=round_decimal(totals.fat_g / Decimal(recipe.servings)),
            fiber_g=round_decimal(totals.fiber_g / Decimal(recipe.servings)),
            sodium_mg=round_decimal(totals.sodium_mg / Decimal(recipe.servings)),
        )
        return RecipeCalculation(recipe_id=recipe_id, total=totals, per_serving=per_serving)
