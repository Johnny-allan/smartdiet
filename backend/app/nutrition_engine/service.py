from decimal import Decimal

from app.nutrition_engine.schemas import (
    AdequacyRead,
    ClinicalAlertRead,
    ClinicalAlertsRead,
    ClinicalAlertsRequest,
    EnergyTargetRead,
    EnergyTargetRequest,
    EquivalentSubstitutionRead,
    EquivalentSubstitutionRequest,
    MacroTargetRead,
    MacroTargetRequest,
    MealAnalysisInput,
    MealAnalysisRead,
    MealPlanAnalyzeRead,
    MealPlanAnalyzeRequest,
    NutrientTotals,
    NutritionFoodInput,
)
from app.shared.nutrition import decimal_or_zero, round_decimal


ACTIVITY_FACTORS = {
    "sedentary": Decimal("1.20"),
    "light": Decimal("1.375"),
    "moderate": Decimal("1.55"),
    "active": Decimal("1.725"),
    "very_active": Decimal("1.90"),
}

OBJECTIVE_ADJUSTMENTS = {
    "fat_loss": Decimal("-500"),
    "maintenance": Decimal("0"),
    "lean_mass_gain": Decimal("250"),
    "weight_gain": Decimal("400"),
    "glycemic_control": Decimal("-150"),
}

DEFAULT_PROTEIN_G_PER_KG = {
    "fat_loss": Decimal("1.8"),
    "maintenance": Decimal("1.4"),
    "lean_mass_gain": Decimal("2.0"),
    "weight_gain": Decimal("1.7"),
    "glycemic_control": Decimal("1.5"),
}

DEFAULT_FAT_PERCENT = {
    "fat_loss": Decimal("25"),
    "maintenance": Decimal("28"),
    "lean_mass_gain": Decimal("25"),
    "weight_gain": Decimal("30"),
    "glycemic_control": Decimal("30"),
}


def calculate_energy_target(payload: EnergyTargetRequest) -> EnergyTargetRead:
    bmr = _calculate_bmr(payload)
    activity_factor = ACTIVITY_FACTORS[payload.activity_level]
    tdee = round_decimal(bmr * activity_factor)
    adjustment = (
        payload.custom_adjustment_kcal
        if payload.custom_adjustment_kcal is not None
        else OBJECTIVE_ADJUSTMENTS[payload.objective]
    )
    target = max(Decimal("800"), tdee + adjustment)
    return EnergyTargetRead(
        formula=payload.formula,
        bmr_kcal=round_decimal(bmr),
        activity_factor=activity_factor,
        tdee_kcal=tdee,
        objective_adjustment_kcal=round_decimal(adjustment),
        target_kcal=round_decimal(target),
    )


def calculate_macro_targets(payload: MacroTargetRequest) -> MacroTargetRead:
    protein_base_kg = payload.lean_mass_kg or payload.weight_kg
    protein_ratio = payload.protein_g_per_kg or DEFAULT_PROTEIN_G_PER_KG[payload.objective]
    fat_percent = payload.fat_percent or DEFAULT_FAT_PERCENT[payload.objective]

    protein_g = round_decimal(protein_base_kg * protein_ratio)
    protein_kcal = round_decimal(protein_g * Decimal("4"))
    fat_kcal = round_decimal(payload.target_kcal * fat_percent / Decimal("100"))
    fat_g = round_decimal(fat_kcal / Decimal("9"))
    remaining_kcal = payload.target_kcal - protein_kcal - fat_kcal
    carbs_kcal = max(Decimal("0"), remaining_kcal)
    carbs_g = round_decimal(carbs_kcal / Decimal("4"))

    return MacroTargetRead(
        protein_g=protein_g,
        protein_kcal=protein_kcal,
        protein_percent=_percent(protein_kcal, payload.target_kcal),
        carbs_g=carbs_g,
        carbs_kcal=round_decimal(carbs_kcal),
        carbs_percent=_percent(carbs_kcal, payload.target_kcal),
        fat_g=fat_g,
        fat_kcal=fat_kcal,
        fat_percent=_percent(fat_kcal, payload.target_kcal),
    )


def analyze_meal_plan(payload: MealPlanAnalyzeRequest) -> MealPlanAnalyzeRead:
    meal_reads = [
        MealAnalysisRead(name=meal.name, totals=_sum_foods(meal.items))
        for meal in payload.meals
    ]
    daily_totals = _sum_totals([meal.totals for meal in meal_reads])
    adequacy = AdequacyRead(
        kcal_percent=_optional_percent(daily_totals.kcal, payload.target_kcal),
        protein_percent=_optional_percent(daily_totals.protein_g, payload.target_protein_g),
        carbs_percent=_optional_percent(daily_totals.carbs_g, payload.target_carbs_g),
        fat_percent=_optional_percent(daily_totals.fat_g, payload.target_fat_g),
    )
    return MealPlanAnalyzeRead(meals=meal_reads, daily_totals=daily_totals, adequacy=adequacy)


def calculate_equivalent_substitution(payload: EquivalentSubstitutionRequest) -> EquivalentSubstitutionRead:
    reference_target = _strategy_total(payload.reference_food, payload.strategy)
    candidate_per_100g = _strategy_per_100g(payload.candidate_food, payload.strategy)
    candidate_grams = round_decimal(reference_target * Decimal("100") / candidate_per_100g)
    candidate_food = payload.candidate_food.model_copy(update={"grams": candidate_grams})

    reference_totals = _food_totals(payload.reference_food)
    candidate_totals = _food_totals(candidate_food)
    return EquivalentSubstitutionRead(
        strategy=payload.strategy,
        reference_grams=payload.reference_food.grams,
        candidate_grams=candidate_grams,
        reference_totals=reference_totals,
        candidate_totals=candidate_totals,
        delta=_subtract_totals(candidate_totals, reference_totals),
    )


def calculate_clinical_alerts(payload: ClinicalAlertsRequest) -> ClinicalAlertsRead:
    alerts: list[ClinicalAlertRead] = []
    totals = payload.daily_totals

    if "hypertension" in payload.conditions and totals.sodium_mg > payload.sodium_limit_mg:
        alerts.append(
            ClinicalAlertRead(
                code="sodium_high_hypertension",
                severity="critical",
                message="Sodio acima do limite definido para paciente com hipertensao.",
            )
        )
    elif totals.sodium_mg > payload.sodium_limit_mg:
        alerts.append(
            ClinicalAlertRead(
                code="sodium_high",
                severity="warning",
                message="Sodio diario acima do limite configurado.",
            )
        )

    if totals.fiber_g < payload.fiber_min_g:
        alerts.append(
            ClinicalAlertRead(
                code="fiber_low",
                severity="warning",
                message="Fibras abaixo da meta minima configurada.",
            )
        )

    if "diabetes" in payload.conditions and totals.carbs_g > Decimal("250"):
        alerts.append(
            ClinicalAlertRead(
                code="carbs_high_diabetes",
                severity="warning",
                message="Carboidratos diarios elevados para paciente com diabetes; revisar distribuicao por refeicao.",
            )
        )

    if "renal" in payload.conditions and payload.protein_max_g is not None and totals.protein_g > payload.protein_max_g:
        alerts.append(
            ClinicalAlertRead(
                code="protein_high_renal",
                severity="critical",
                message="Proteina acima do limite configurado para paciente renal.",
            )
        )

    if not alerts:
        alerts.append(
            ClinicalAlertRead(
                code="no_alerts",
                severity="info",
                message="Nenhum alerta clinico encontrado para os limites informados.",
            )
        )
    return ClinicalAlertsRead(alerts=alerts)


def _calculate_bmr(payload: EnergyTargetRequest) -> Decimal:
    if payload.formula == "cunningham":
        if payload.lean_mass_kg is None:
            raise ValueError("Lean mass is required for Cunningham formula")
        return Decimal("500") + Decimal("22") * payload.lean_mass_kg

    if payload.formula == "harris_benedict":
        if payload.sex == "male":
            return Decimal("88.362") + Decimal("13.397") * payload.weight_kg + Decimal("4.799") * payload.height_cm - Decimal("5.677") * Decimal(payload.age)
        return Decimal("447.593") + Decimal("9.247") * payload.weight_kg + Decimal("3.098") * payload.height_cm - Decimal("4.330") * Decimal(payload.age)

    sex_constant = Decimal("5") if payload.sex == "male" else Decimal("-161")
    return Decimal("10") * payload.weight_kg + Decimal("6.25") * payload.height_cm - Decimal("5") * Decimal(payload.age) + sex_constant


def _sum_foods(items: list[NutritionFoodInput]) -> NutrientTotals:
    return _sum_totals([_food_totals(item) for item in items])


def _food_totals(food: NutritionFoodInput) -> NutrientTotals:
    factor = food.grams / Decimal("100")
    return NutrientTotals(
        kcal=round_decimal(decimal_or_zero(food.kcal_per_100g) * factor),
        protein_g=round_decimal(decimal_or_zero(food.protein_per_100g) * factor),
        carbs_g=round_decimal(decimal_or_zero(food.carbs_per_100g) * factor),
        fat_g=round_decimal(decimal_or_zero(food.fat_per_100g) * factor),
        fiber_g=round_decimal(decimal_or_zero(food.fiber_per_100g) * factor),
        sodium_mg=round_decimal(decimal_or_zero(food.sodium_per_100g) * factor),
    )


def _sum_totals(totals: list[NutrientTotals]) -> NutrientTotals:
    return NutrientTotals(
        kcal=round_decimal(sum((item.kcal for item in totals), Decimal("0"))),
        protein_g=round_decimal(sum((item.protein_g for item in totals), Decimal("0"))),
        carbs_g=round_decimal(sum((item.carbs_g for item in totals), Decimal("0"))),
        fat_g=round_decimal(sum((item.fat_g for item in totals), Decimal("0"))),
        fiber_g=round_decimal(sum((item.fiber_g for item in totals), Decimal("0"))),
        sodium_mg=round_decimal(sum((item.sodium_mg for item in totals), Decimal("0"))),
    )


def _subtract_totals(left: NutrientTotals, right: NutrientTotals) -> NutrientTotals:
    return NutrientTotals(
        kcal=round_decimal(left.kcal - right.kcal),
        protein_g=round_decimal(left.protein_g - right.protein_g),
        carbs_g=round_decimal(left.carbs_g - right.carbs_g),
        fat_g=round_decimal(left.fat_g - right.fat_g),
        fiber_g=round_decimal(left.fiber_g - right.fiber_g),
        sodium_mg=round_decimal(left.sodium_mg - right.sodium_mg),
    )


def _strategy_total(food: NutritionFoodInput, strategy: str) -> Decimal:
    totals = _food_totals(food)
    return {
        "kcal": totals.kcal,
        "carbs": totals.carbs_g,
        "protein": totals.protein_g,
    }[strategy]


def _strategy_per_100g(food: NutritionFoodInput, strategy: str) -> Decimal:
    return decimal_or_zero(
        {
            "kcal": food.kcal_per_100g,
            "carbs": food.carbs_per_100g,
            "protein": food.protein_per_100g,
        }[strategy]
    )


def _percent(value: Decimal, target: Decimal) -> Decimal:
    if target <= 0:
        return Decimal("0")
    return round_decimal(value * Decimal("100") / target)


def _optional_percent(value: Decimal, target: Decimal | None) -> Decimal | None:
    if target is None:
        return None
    return _percent(value, target)
