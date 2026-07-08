from dataclasses import dataclass


@dataclass(frozen=True)
class NutrientMapping:
    code: str
    display_name_pt: str
    unit: str
    group: str


USDA_NUTRIENT_MAP: dict[str, NutrientMapping] = {
    "Energy": NutrientMapping("kcal", "Energia", "kcal", "macros"),
    "Protein": NutrientMapping("protein_g", "Proteinas", "g", "macros"),
    "Carbohydrate, by difference": NutrientMapping("carbs_g", "Carboidratos", "g", "macros"),
    "Total lipid (fat)": NutrientMapping("fat_g", "Gorduras", "g", "macros"),
    "Fiber, total dietary": NutrientMapping("fiber_g", "Fibras", "g", "macros"),
    "Sodium, Na": NutrientMapping("sodium_mg", "Sodio", "mg", "minerals"),
}


USDA_COMMON_FOOD_TRANSLATIONS: dict[str, str] = {
    "Chicken breast, roasted": "Peito de frango assado",
    "Rice, white, cooked": "Arroz branco cozido",
    "Beans, black, mature seeds, cooked": "Feijao preto cozido",
    "Egg, whole, cooked, hard-boiled": "Ovo cozido",
    "Bananas, raw": "Banana",
    "Apples, raw, with skin": "Maca com casca",
}


def translate_usda_food_name(external_name: str) -> str:
    return USDA_COMMON_FOOD_TRANSLATIONS.get(external_name, external_name)
