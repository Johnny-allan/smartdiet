from decimal import Decimal

from app.etl.open_food_facts import open_food_facts_product_to_food_create


def test_open_food_facts_product_maps_to_food_create() -> None:
    product = {
        "code": "7891000100103",
        "product_name": "Corn flakes",
        "product_name_pt": "Cereal de milho",
        "generic_name_pt": "Cereal matinal",
        "brands": "Marca Demo",
        "categories_tags": ["en:breakfast-cereals", "pt:cereais-matinais"],
        "image_url": "https://example.com/image.jpg",
        "nutriments": {
            "energy-kcal_100g": 380,
            "proteins_100g": 7.5,
            "carbohydrates_100g": 84,
            "fat_100g": 1.2,
            "fiber_100g": 3,
            "sodium_100g": 0.5,
        },
    }

    food = open_food_facts_product_to_food_create(product)

    assert food is not None
    assert food.name == "Cereal de milho"
    assert food.original_name == "Corn flakes"
    assert food.source_name == "Open Food Facts"
    assert food.external_id == "7891000100103"
    assert food.source_locale == "pt-BR"
    assert food.verified is False
    assert "Corn flakes" in food.aliases
    sodium = next(item for item in food.nutrients if item.nutrient_code == "sodium_mg")
    assert sodium.amount_per_100g == Decimal("500.0")


def test_open_food_facts_product_without_name_is_skipped() -> None:
    assert open_food_facts_product_to_food_create({"code": "123"}) is None
