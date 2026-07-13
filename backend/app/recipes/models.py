from decimal import Decimal
from typing import Optional

from sqlalchemy import ForeignKey, Integer, JSON, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin, UUIDMixin


class Recipe(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "recipes"
    __table_args__ = {"schema": "recipes"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("patients.patients.id", ondelete="CASCADE"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    preparation_method: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    prep_time_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    cook_time_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    servings: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    raw_weight_g: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    cooked_weight_g: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    yield_weight_g: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(400), nullable=True)
    tags: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    professional_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class RecipeItem(Base):
    __tablename__ = "recipe_items"
    __table_args__ = {"schema": "recipes"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.recipes.id", ondelete="CASCADE"), nullable=False, index=True)
    food_id: Mapped[int] = mapped_column(ForeignKey("foods.foods.id"), nullable=False, index=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    unit: Mapped[str] = mapped_column(String(40), nullable=False)
    grams: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
