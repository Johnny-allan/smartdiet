import unicodedata

from app.foods.schemas import TacoFoodRead
from app.foods.taco_local import list_taco_foods
from app.foods.tbca_data import TBCA_FOODS


def _normalize(value: str) -> str:
    text = unicodedata.normalize("NFKD", value.lower())
    return "".join(char for char in text if not unicodedata.combining(char))


def list_brazilian_foods(limit: int) -> list[TacoFoodRead]:
    return [*[_to_schema(food) for food in TBCA_FOODS], *list_taco_foods(10_000)][:limit]


def search_brazilian_foods(query: str, limit: int) -> list[TacoFoodRead]:
    needle = _normalize(query)
    tokens = needle.split()
    results = [
        food
        for food in [*[_to_schema(item) for item in TBCA_FOODS], *list_taco_foods(10_000)]
        if all(token in _normalize(f"{food.name} {food.category} {food.source}") for token in tokens)
    ]
    return results[:limit]


def _to_schema(item: dict) -> TacoFoodRead:
    return TacoFoodRead(**item)
