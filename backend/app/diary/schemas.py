from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class FoodDiaryEntryCreate(BaseModel):
    date: date
    meal_type: str
    food_id: int | None = None
    recipe_id: int | None = None
    quantity: Decimal = Field(gt=0)
    grams: Decimal = Field(gt=0)
    notes: str | None = None

    @model_validator(mode="after")
    def validate_reference(self) -> "FoodDiaryEntryCreate":
        if self.food_id is None and self.recipe_id is None and not self.notes:
            raise ValueError("Diary entry must reference a food, recipe, or textual note")
        return self


class FoodDiaryEntryUpdate(FoodDiaryEntryCreate):
    pass


class FoodDiaryEntryRead(FoodDiaryEntryCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
