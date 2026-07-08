from decimal import Decimal
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin, UUIDMixin


class FoodSource(Base):
    __tablename__ = "food_sources"
    __table_args__ = {"schema": "foods"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    license: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    url: Mapped[Optional[str]] = mapped_column(String(400), nullable=True)
    attribution_required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    redistribution_allowed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class Food(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "foods"
    __table_args__ = {"schema": "foods"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source_id: Mapped[Optional[int]] = mapped_column(ForeignKey("foods.food_sources.id"), nullable=True)
    external_id: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    normalized_name: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    original_name: Mapped[Optional[str]] = mapped_column(String(240), nullable=True)
    source_locale: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    scientific_name: Mapped[Optional[str]] = mapped_column(String(180), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(400), nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class Nutrient(Base):
    __tablename__ = "nutrients"
    __table_args__ = {"schema": "nutrition"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    nutrient_group: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)


class FoodNutrient(Base):
    __tablename__ = "food_nutrients"
    __table_args__ = {"schema": "nutrition"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    food_id: Mapped[int] = mapped_column(ForeignKey("foods.foods.id"), nullable=False, index=True)
    nutrient_id: Mapped[int] = mapped_column(ForeignKey("nutrition.nutrients.id"), nullable=False, index=True)
    amount_per_100g: Mapped[Decimal] = mapped_column(Numeric(12, 4), nullable=False)


class FoodAlias(Base):
    __tablename__ = "food_aliases"
    __table_args__ = {"schema": "foods"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    food_id: Mapped[int] = mapped_column(ForeignKey("foods.foods.id"), nullable=False, index=True)
    alias: Mapped[str] = mapped_column(String(180), nullable=False)
    normalized_alias: Mapped[str] = mapped_column(String(180), nullable=False, index=True)


class ServingMeasure(Base):
    __tablename__ = "serving_measures"
    __table_args__ = {"schema": "foods"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    food_id: Mapped[int] = mapped_column(ForeignKey("foods.foods.id"), nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(160), nullable=False)
    gram_weight: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    household_measure: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
