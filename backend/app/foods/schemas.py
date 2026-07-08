from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class FoodSourceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    license: str | None = None
    url: str | None = None
    attribution_required: bool
    redistribution_allowed: bool


class NutrientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    unit: str
    nutrient_group: str | None = None


class FoodNutrientCreate(BaseModel):
    nutrient_code: str = Field(max_length=40)
    nutrient_name: str = Field(max_length=120)
    unit: str = Field(max_length=20)
    amount_per_100g: Decimal = Field(ge=0)
    nutrient_group: str | None = None


class FoodNutrientRead(BaseModel):
    code: str
    name: str
    unit: str
    amount_per_100g: Decimal


class TacoFoodRead(BaseModel):
    id: str
    taco_code: int
    name: str
    category: str
    source: str
    kcal: Decimal | None = None
    protein: Decimal | None = None
    carbs: Decimal | None = None
    fat: Decimal | None = None
    fiber: Decimal | None = None
    sodium: Decimal | None = None


class ServingMeasureCreate(BaseModel):
    description: str
    gram_weight: Decimal = Field(gt=0)
    household_measure: str | None = None


class ServingMeasureRead(ServingMeasureCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int


class FoodCreate(BaseModel):
    name: str = Field(min_length=2, max_length=180)
    category: str | None = None
    source_name: str | None = None
    external_id: str | None = None
    original_name: str | None = None
    source_locale: str | None = None
    scientific_name: str | None = None
    description: str | None = None
    image_url: str | None = None
    verified: bool = False
    aliases: list[str] = Field(default_factory=list)
    nutrients: list[FoodNutrientCreate] = Field(default_factory=list)
    serving_measures: list[ServingMeasureCreate] = Field(default_factory=list)


class FoodSummaryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uuid: UUID
    name: str
    normalized_name: str
    original_name: str | None = None
    source_locale: str | None = None
    category: str | None = None
    verified: bool
    created_at: datetime
    updated_at: datetime


class FoodRead(FoodSummaryRead):
    aliases: list[str] = Field(default_factory=list)
    nutrients: list[FoodNutrientRead] = Field(default_factory=list)
    serving_measures: list[ServingMeasureRead] = Field(default_factory=list)
