from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.foods.models import Food  # noqa: F401
from app.recipes.models import Recipe  # noqa: F401


class FoodDiaryEntry(Base):
    __tablename__ = "food_diary_entries"
    __table_args__ = {"schema": "diary"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.patients.id"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    meal_type: Mapped[str] = mapped_column(String(80), nullable=False)
    food_id: Mapped[Optional[int]] = mapped_column(ForeignKey("foods.foods.id"), nullable=True)
    recipe_id: Mapped[Optional[int]] = mapped_column(ForeignKey("recipes.recipes.id"), nullable=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    grams: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
