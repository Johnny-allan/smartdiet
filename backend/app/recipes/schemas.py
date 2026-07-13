from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RecipeItemCreate(BaseModel):
    food_id: int
    quantity: Decimal = Field(gt=0)
    unit: str = Field(max_length=40)
    grams: Decimal = Field(gt=0)


class RecipeItemRead(RecipeItemCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    recipe_id: int


class RecipeCreate(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    description: str | None = None
    preparation_method: str | None = None
    prep_time_minutes: int | None = Field(default=None, ge=0)
    cook_time_minutes: int | None = Field(default=None, ge=0)
    servings: int = Field(default=1, gt=0)
    raw_weight_g: Decimal | None = None
    cooked_weight_g: Decimal | None = None
    yield_weight_g: Decimal | None = None
    image_url: str | None = None
    tags: list[str] = Field(default_factory=list)
    professional_notes: str | None = None
    items: list[RecipeItemCreate] = Field(default_factory=list)


class RecipeUpdate(RecipeCreate):
    pass


class RecipeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    uuid: UUID
    title: str
    description: str | None = None
    preparation_method: str | None = None
    prep_time_minutes: int | None = None
    cook_time_minutes: int | None = None
    servings: int
    raw_weight_g: Decimal | None = None
    cooked_weight_g: Decimal | None = None
    yield_weight_g: Decimal | None = None
    image_url: str | None = None
    tags: list[str]
    professional_notes: str | None = None
    created_at: datetime
    updated_at: datetime


class NutritionTotals(BaseModel):
    kcal: Decimal = Decimal("0")
    protein_g: Decimal = Decimal("0")
    carbs_g: Decimal = Decimal("0")
    fat_g: Decimal = Decimal("0")
    fiber_g: Decimal = Decimal("0")
    sodium_mg: Decimal = Decimal("0")


class RecipeCalculation(BaseModel):
    recipe_id: int
    total: NutritionTotals
    per_serving: NutritionTotals
