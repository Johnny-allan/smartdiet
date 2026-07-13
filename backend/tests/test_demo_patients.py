from app.plans.schemas import REQUIRED_MEALS
from app.shared.nutrition import normalize_text
from scripts.seed_demo_patients import DEMO_PATIENTS


def test_demo_patients_cover_three_distinct_clinical_profiles() -> None:
    assert len(DEMO_PATIENTS) == 3
    assert len({profile["patient"]["email"] for profile in DEMO_PATIENTS}) == 3
    assert {profile["anamnesis"]["objective_type"] for profile in DEMO_PATIENTS} == {
        "cardiovascular",
        "muscle_gain",
        "glycemic_control",
    }
    assert all(len(profile["bioimpedance"]) == 2 for profile in DEMO_PATIENTS)


def test_every_demo_plan_has_required_meals_and_patient_specific_foods() -> None:
    required = {normalize_text(meal) for meal in REQUIRED_MEALS}
    for profile in DEMO_PATIENTS:
        meals = profile["plan"]["meals"]
        assert {normalize_text(meal["meal_type"]) for meal in meals} == required
        assert sum(len(meal["items"]) for meal in meals) >= 6


def test_mediterranean_demo_uses_core_food_groups() -> None:
    mediterranean = DEMO_PATIENTS[0]
    content = " ".join(
        item["notes"].lower()
        for meal in mediterranean["plan"]["meals"]
        for item in meal["items"]
    )
    for expected in ["arroz integral", "feijao", "sardinha", "azeite", "castanha", "lentilha"]:
        assert expected in content
