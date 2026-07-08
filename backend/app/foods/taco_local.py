from decimal import Decimal
from typing import Any

from app.foods.schemas import TacoFoodRead
from app.foods.taco_data import TACO_FOODS
from app.shared.nutrition import normalize_text


def list_taco_foods(limit: int = 100) -> list[TacoFoodRead]:
    return [_to_schema(item) for item in TACO_FOODS[:limit]]


def search_taco_foods(query: str, limit: int = 30) -> list[TacoFoodRead]:
    normalized = normalize_text(query)
    if not normalized:
        return []
    tokens = normalized.split()

    matches = [
        item
        for item in TACO_FOODS
        if all(token in normalize_text(f"{item['name']} {item['category']}") for token in tokens)
    ]
    return [_to_schema(item) for item in matches[:limit]]


def _to_schema(item: dict[str, Any]) -> TacoFoodRead:
    return TacoFoodRead(
        id=str(item["id"]),
        taco_code=int(item["taco_code"]),
        name=str(item["name"]),
        category=str(item["category"]),
        source=str(item["source"]),
        kcal=_decimal_or_none(item.get("kcal")),
        protein=_decimal_or_none(item.get("protein")),
        carbs=_decimal_or_none(item.get("carbs")),
        fat=_decimal_or_none(item.get("fat")),
        fiber=_decimal_or_none(item.get("fiber")),
        sodium=_decimal_or_none(item.get("sodium")),
    )


def _decimal_or_none(value: Any) -> Decimal | None:
    if value is None:
        return None
    return Decimal(str(value))
