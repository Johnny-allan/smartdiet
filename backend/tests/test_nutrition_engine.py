from decimal import Decimal

from fastapi.testclient import TestClient

from app.main import create_app
from app.nutrition_engine.schemas import (
    EnergyTargetRequest,
    EquivalentSubstitutionRequest,
    MacroTargetRequest,
    NutritionFoodInput,
)
from app.nutrition_engine.service import (
    calculate_energy_target,
    calculate_equivalent_substitution,
    calculate_macro_targets,
)


def test_energy_target_uses_mifflin_activity_and_objective_adjustment() -> None:
    result = calculate_energy_target(
        EnergyTargetRequest(
            sex="female",
            age=35,
            weight_kg=Decimal("70"),
            height_cm=Decimal("165"),
            activity_level="moderate",
            objective="fat_loss",
        )
    )

    assert result.bmr_kcal == Decimal("1395.25")
    assert result.tdee_kcal == Decimal("2162.64")
    assert result.objective_adjustment_kcal == Decimal("-500.00")
    assert result.target_kcal == Decimal("1662.64")


def test_macro_targets_allocate_protein_fat_and_carbs() -> None:
    result = calculate_macro_targets(
        MacroTargetRequest(
            target_kcal=Decimal("2200"),
            weight_kg=Decimal("80"),
            objective="lean_mass_gain",
        )
    )

    assert result.protein_g == Decimal("160.00")
    assert result.fat_g == Decimal("61.11")
    assert result.carbs_g == Decimal("252.50")


def test_equivalent_substitution_calculates_candidate_grams_by_carbs() -> None:
    result = calculate_equivalent_substitution(
        EquivalentSubstitutionRequest(
            strategy="carbs",
            reference_food=NutritionFoodInput(
                name="Arroz, integral, cozido",
                grams=Decimal("100"),
                kcal_per_100g=Decimal("123.53"),
                protein_per_100g=Decimal("2.59"),
                carbs_per_100g=Decimal("25.81"),
                fat_per_100g=Decimal("1.00"),
            ),
            candidate_food=NutritionFoodInput(
                name="Batata, inglesa, cozida",
                grams=Decimal("100"),
                kcal_per_100g=Decimal("51.59"),
                protein_per_100g=Decimal("1.16"),
                carbs_per_100g=Decimal("11.94"),
                fat_per_100g=Decimal("0"),
            ),
        )
    )

    assert result.candidate_grams == Decimal("216.16")
    assert result.candidate_totals.carbs_g == Decimal("25.81")
    assert result.delta.kcal < 0


def test_nutrition_engine_api_analyzes_meal_plan_and_alerts() -> None:
    client = TestClient(create_app())

    analysis = client.post(
        "/api/v1/nutrition/meal-plan/analyze",
        json={
            "target_kcal": "1800",
            "target_protein_g": "120",
            "meals": [
                {
                    "name": "Almoco",
                    "items": [
                        {
                            "name": "Arroz, integral, cozido",
                            "grams": "100",
                            "kcal_per_100g": "123.53",
                            "protein_per_100g": "2.59",
                            "carbs_per_100g": "25.81",
                            "fat_per_100g": "1.00",
                            "fiber_per_100g": "2.75",
                            "sodium_per_100g": "1.24",
                        }
                    ],
                }
            ],
        },
    )

    assert analysis.status_code == 200
    assert analysis.json()["data"]["daily_totals"]["carbs_g"] == "25.81"

    alerts = client.post(
        "/api/v1/nutrition/clinical-alerts",
        json={
            "daily_totals": {
                "kcal": "1800",
                "protein_g": "90",
                "carbs_g": "260",
                "fat_g": "60",
                "fiber_g": "12",
                "sodium_mg": "2600",
            },
            "conditions": ["hypertension", "diabetes"],
        },
    )

    assert alerts.status_code == 200
    codes = [item["code"] for item in alerts.json()["data"]["alerts"]]
    assert "sodium_high_hypertension" in codes
    assert "fiber_low" in codes
    assert "carbs_high_diabetes" in codes
