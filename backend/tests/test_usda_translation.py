from app.etl.usda_translation import USDA_NUTRIENT_MAP, translate_usda_food_name


def test_usda_nutrient_map_uses_portuguese_display_names() -> None:
    protein = USDA_NUTRIENT_MAP["Protein"]

    assert protein.code == "protein_g"
    assert protein.display_name_pt == "Proteinas"
    assert protein.unit == "g"


def test_usda_food_translation_keeps_unknown_name_for_review() -> None:
    assert translate_usda_food_name("Chicken breast, roasted") == "Peito de frango assado"
    assert translate_usda_food_name("Unknown food") == "Unknown food"
