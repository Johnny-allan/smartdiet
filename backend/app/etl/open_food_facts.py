from decimal import Decimal, InvalidOperation
from typing import Any

import httpx

from app.foods.schemas import FoodCreate, FoodNutrientCreate

OPEN_FOOD_FACTS_SOURCE_NAME = "Open Food Facts"
OPEN_FOOD_FACTS_LICENSE = "ODbL"
OPEN_FOOD_FACTS_URL = "https://world.openfoodfacts.org"
OPEN_FOOD_FACTS_SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl"
OPEN_FOOD_FACTS_USER_AGENT = "SmartDiet/0.1.0 (https://smartdiet.local; contact: dev@smartdiet.local)"


OFF_NUTRIENT_MAP = {
    "energy-kcal_100g": ("kcal", "Energia", "kcal", "macros", Decimal("1")),
    "proteins_100g": ("protein_g", "Proteinas", "g", "macros", Decimal("1")),
    "carbohydrates_100g": ("carbs_g", "Carboidratos", "g", "macros", Decimal("1")),
    "fat_100g": ("fat_g", "Gorduras", "g", "macros", Decimal("1")),
    "fiber_100g": ("fiber_g", "Fibras", "g", "macros", Decimal("1")),
    "sodium_100g": ("sodium_mg", "Sodio", "mg", "minerals", Decimal("1000")),
}


class OpenFoodFactsClient:
    def __init__(self, timeout_seconds: float = 20.0) -> None:
        self.timeout_seconds = timeout_seconds

    def search_products(self, query: str, page_size: int = 20, country: str = "br") -> list[dict[str, Any]]:
        params = {
            "search_terms": query,
            "search_simple": 1,
            "action": "process",
            "json": 1,
            "page_size": page_size,
            "countries_tags": country,
            "fields": ",".join(
                [
                    "code",
                    "product_name",
                    "product_name_pt",
                    "generic_name",
                    "generic_name_pt",
                    "brands",
                    "categories",
                    "categories_tags",
                    "image_url",
                    "nutriments",
                ]
            ),
        }
        headers = {"User-Agent": OPEN_FOOD_FACTS_USER_AGENT}
        with httpx.Client(timeout=self.timeout_seconds, headers=headers) as client:
            response = client.get(OPEN_FOOD_FACTS_SEARCH_URL, params=params)
            response.raise_for_status()
            payload = response.json()
        products = payload.get("products", [])
        if not isinstance(products, list):
            return []
        return [product for product in products if isinstance(product, dict)]


def open_food_facts_product_to_food_create(product: dict[str, Any]) -> FoodCreate | None:
    name = _first_text(product, ["product_name_pt", "product_name", "generic_name_pt", "generic_name"])
    external_id = _first_text(product, ["code"])
    if name is None or external_id is None:
        return None

    original_name = _first_text(product, ["product_name", "generic_name"])
    category = _extract_category(product)
    aliases = _extract_aliases(product, name)
    nutrients = _extract_nutrients(product.get("nutriments", {}))

    return FoodCreate(
        name=name[:180],
        original_name=original_name,
        source_locale="pt-BR" if product.get("product_name_pt") else "mixed",
        category=category,
        source_name=OPEN_FOOD_FACTS_SOURCE_NAME,
        external_id=external_id,
        description=_first_text(product, ["generic_name_pt", "generic_name"]),
        image_url=_first_text(product, ["image_url"]),
        verified=False,
        aliases=aliases,
        nutrients=nutrients,
    )


def _first_text(product: dict[str, Any], keys: list[str]) -> str | None:
    for key in keys:
        value = product.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None


def _extract_category(product: dict[str, Any]) -> str | None:
    categories = product.get("categories_tags")
    if isinstance(categories, list) and categories:
        last = str(categories[-1])
        return last.split(":", 1)[-1].replace("-", " ")[:120]
    return _first_text(product, ["categories"])


def _extract_aliases(product: dict[str, Any], primary_name: str) -> list[str]:
    candidates = [
        product.get("product_name"),
        product.get("product_name_pt"),
        product.get("generic_name"),
        product.get("generic_name_pt"),
        product.get("brands"),
    ]
    aliases: list[str] = []
    seen = {primary_name.lower()}
    for candidate in candidates:
        if not isinstance(candidate, str):
            continue
        for part in candidate.split(","):
            alias = part.strip()
            if alias and alias.lower() not in seen:
                seen.add(alias.lower())
                aliases.append(alias[:180])
    return aliases


def _extract_nutrients(nutriments: Any) -> list[FoodNutrientCreate]:
    if not isinstance(nutriments, dict):
        return []

    nutrients: list[FoodNutrientCreate] = []
    for off_key, (code, name, unit, group, multiplier) in OFF_NUTRIENT_MAP.items():
        amount = _decimal_from_value(nutriments.get(off_key))
        if amount is None:
            continue
        nutrients.append(
            FoodNutrientCreate(
                nutrient_code=code,
                nutrient_name=name,
                unit=unit,
                nutrient_group=group,
                amount_per_100g=amount * multiplier,
            )
        )
    return nutrients


def _decimal_from_value(value: Any) -> Decimal | None:
    if value is None or value == "":
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        return None
