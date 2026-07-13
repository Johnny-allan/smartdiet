from app.core.exceptions import BusinessRuleError, NotFoundError
from app.patients.repository import PatientRepository
from app.plans.models import MealPlan
from app.plans.repository import MealPlanRepository
from app.plans.schemas import MealPlanCreate, REQUIRED_MEALS
from app.recipes.repository import RecipeRepository
from app.shared.nutrition import normalize_text


class MealPlanService:
    def __init__(
        self,
        repository: MealPlanRepository,
        patients: PatientRepository,
        recipes: RecipeRepository,
    ) -> None:
        self.repository = repository
        self.patients = patients
        self.recipes = recipes

    def _ensure_patient(self, patient_id: int) -> None:
        if self.patients.get(patient_id) is None:
            raise NotFoundError("Patient not found")

    def list_by_patient(self, patient_id: int) -> list[MealPlan]:
        self._ensure_patient(patient_id)
        return self.repository.list_by_patient(patient_id)

    def get_plan(self, plan_id: int) -> MealPlan:
        plan = self.repository.get(plan_id)
        if plan is None:
            raise NotFoundError("Meal plan not found")
        return plan

    def create_plan(self, patient_id: int, data: MealPlanCreate) -> MealPlan:
        self._ensure_patient(patient_id)
        self._validate_plan(patient_id, data)
        return self.repository.create(patient_id, data)

    def update_plan(self, patient_id: int, plan_id: int, data: MealPlanCreate) -> MealPlan:
        self._ensure_patient(patient_id)
        plan = self.repository.get(plan_id)
        if plan is None or plan.patient_id != patient_id:
            raise NotFoundError("Meal plan not found")
        self._validate_plan(patient_id, data)
        return self.repository.update(plan, data)

    def _validate_plan(self, patient_id: int, data: MealPlanCreate) -> None:
        meal_names = {normalize_text(meal.meal_type) for meal in data.meals}
        required = {normalize_text(meal) for meal in REQUIRED_MEALS}
        missing = sorted(required - meal_names)
        if missing:
            raise BusinessRuleError(f"Meal plan must include required meals: {', '.join(missing)}")
        for meal in data.meals:
            for item in meal.items:
                if item.recipe_id is None:
                    continue
                recipe = self.recipes.get(item.recipe_id)
                if recipe is None or recipe.patient_id != patient_id:
                    raise BusinessRuleError("Recipe must belong to the meal plan patient")
