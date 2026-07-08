from app.core.exceptions import NotFoundError
from app.foods.models import Food
from app.foods.repository import FoodRepository
from app.foods.schemas import FoodCreate, FoodNutrientRead, FoodRead


class FoodService:
    def __init__(self, repository: FoodRepository) -> None:
        self.repository = repository

    def list_foods(self) -> list[Food]:
        return self.repository.list()

    def search_foods(self, query: str) -> list[Food]:
        if not query.strip():
            return []
        return self.repository.search(query)

    def create_food(self, data: FoodCreate) -> Food:
        return self.repository.create(data)

    def get_food(self, food_id: int) -> FoodRead:
        food = self.repository.get(food_id)
        if food is None:
            raise NotFoundError("Food not found")
        return self._hydrate(food)

    def get_nutrients(self, food_id: int) -> list[FoodNutrientRead]:
        if self.repository.get(food_id) is None:
            raise NotFoundError("Food not found")
        return [
            FoodNutrientRead(
                code=nutrient.code,
                name=nutrient.name,
                unit=nutrient.unit,
                amount_per_100g=food_nutrient.amount_per_100g,
            )
            for nutrient, food_nutrient in self.repository.nutrients_for(food_id)
        ]

    def _hydrate(self, food: Food) -> FoodRead:
        return FoodRead(
            id=food.id,
            uuid=food.uuid,
            name=food.name,
            normalized_name=food.normalized_name,
            original_name=food.original_name,
            source_locale=food.source_locale,
            category=food.category,
            verified=food.verified,
            created_at=food.created_at,
            updated_at=food.updated_at,
            aliases=self.repository.aliases_for(food.id),
            nutrients=self.get_nutrients(food.id),
            serving_measures=self.repository.measures_for(food.id),
        )
