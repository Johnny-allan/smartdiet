from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.plans.models import MealPlan, MealPlanItem, MealPlanMeal
from app.plans.schemas import MealPlanCreate


class MealPlanRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_by_patient(self, patient_id: int) -> list[MealPlan]:
        return list(
            self.db.scalars(
                select(MealPlan)
                .where(MealPlan.patient_id == patient_id)
                .options(selectinload(MealPlan.meals).selectinload(MealPlanMeal.items))
                .order_by(MealPlan.id.desc())
            )
        )

    def get(self, plan_id: int) -> MealPlan | None:
        return self.db.scalars(
            select(MealPlan)
            .where(MealPlan.id == plan_id)
            .options(selectinload(MealPlan.meals).selectinload(MealPlanMeal.items))
        ).first()

    def create(self, patient_id: int, data: MealPlanCreate) -> MealPlan:
        plan = MealPlan(patient_id=patient_id, **data.model_dump(exclude={"meals"}))
        self.db.add(plan)
        self.db.flush()
        self._replace_meals(plan, data)
        self.db.commit()
        self.db.refresh(plan)
        loaded_plan = self.get(plan.id)
        if loaded_plan is None:
            raise RuntimeError("Created meal plan could not be loaded")
        return loaded_plan

    def update(self, plan: MealPlan, data: MealPlanCreate) -> MealPlan:
        for field, value in data.model_dump(exclude={"meals"}).items():
            setattr(plan, field, value)
        plan.meals.clear()
        self.db.flush()
        self._replace_meals(plan, data)
        self.db.commit()
        loaded_plan = self.get(plan.id)
        if loaded_plan is None:
            raise RuntimeError("Updated meal plan could not be loaded")
        return loaded_plan

    def _replace_meals(self, plan: MealPlan, data: MealPlanCreate) -> None:
        for meal_data in data.meals:
            meal = MealPlanMeal(plan_id=plan.id, **meal_data.model_dump(exclude={"items"}))
            self.db.add(meal)
            self.db.flush()
            for item in meal_data.items:
                self.db.add(MealPlanItem(meal_id=meal.id, **item.model_dump()))
