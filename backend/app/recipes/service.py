from decimal import Decimal

from app.core.exceptions import BusinessRuleError, NotFoundError
from app.recipes.models import Recipe
from app.recipes.repository import RecipeRepository
from app.recipes.schemas import NutritionTotals, RecipeCalculation, RecipeCreate, RecipeUpdate
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
    def __init__(self, repository: RecipeRepository) -> None:
        self.repository = repository

    def list_recipes(self) -> list[Recipe]:
        return self.repository.list()

    def get_recipe(self, recipe_id: int) -> Recipe:
        recipe = self.repository.get(recipe_id)
        if recipe is None:
            raise NotFoundError("Recipe not found")
        return recipe

    def create_recipe(self, data: RecipeCreate) -> Recipe:
        return self.repository.create(data)

    def update_recipe(self, recipe_id: int, data: RecipeUpdate) -> Recipe:
        recipe = self.get_recipe(recipe_id)
        return self.repository.update(recipe, data)

    def delete_recipe(self, recipe_id: int) -> None:
        recipe = self.get_recipe(recipe_id)
        self.repository.delete(recipe)

    def calculate_recipe(self, recipe_id: int) -> RecipeCalculation:
        recipe = self.get_recipe(recipe_id)
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
