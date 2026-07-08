from datetime import date, datetime, time as datetime_time
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator


REQUIRED_MEALS = [
    "Cafe da manha",
    "Lanche da manha",
    "Almoco",
    "Lanche da tarde",
    "Jantar",
    "Ceia",
]


class MealPlanItemCreate(BaseModel):
    food_id: int | None = None
    recipe_id: int | None = None
    quantity: Decimal = Field(gt=0)
    unit: str
    grams: Decimal = Field(gt=0)
    notes: str | None = None

    @model_validator(mode="after")
    def validate_reference(self) -> "MealPlanItemCreate":
        if self.food_id is None and self.recipe_id is None and not self.notes:
            raise ValueError("Meal plan item must reference a food, recipe, or textual note")
        return self


class MealPlanMealCreate(BaseModel):
    meal_type: str
    time: datetime_time | None = None
    notes: str | None = None
    items: list[MealPlanItemCreate] = Field(default_factory=list)


class MealPlanCreate(BaseModel):
    title: str
    start_date: date | None = None
    end_date: date | None = None
    target_kcal: Decimal | None = None
    target_protein_g: Decimal | None = None
    target_carbs_g: Decimal | None = None
    target_fat_g: Decimal | None = None
    notes: str | None = None
    meals: list[MealPlanMealCreate] = Field(default_factory=list)


class MealPlanItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    food_id: int | None = None
    recipe_id: int | None = None
    quantity: Decimal
    unit: str
    grams: Decimal
    notes: str | None = None


class MealPlanMealRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meal_type: str
    time: datetime_time | None = None
    notes: str | None = None
    items: list[MealPlanItemRead] = Field(default_factory=list)


class MealPlanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    title: str
    start_date: date | None = None
    end_date: date | None = None
    target_kcal: Decimal | None = None
    target_protein_g: Decimal | None = None
    target_carbs_g: Decimal | None = None
    target_fat_g: Decimal | None = None
    notes: str | None = None
    meals: list[MealPlanMealRead] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
