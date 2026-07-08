from datetime import date, time
from decimal import Decimal
from typing import Optional

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin
from app.foods.models import Food  # noqa: F401
from app.recipes.models import Recipe  # noqa: F401


class MealPlan(Base, TimestampMixin):
    __tablename__ = "meal_plans"
    __table_args__ = {"schema": "plans"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.patients.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    target_kcal: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    target_protein_g: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    target_carbs_g: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    target_fat_g: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    meals: Mapped[list["MealPlanMeal"]] = relationship(
        back_populates="plan",
        cascade="all, delete-orphan",
        order_by="MealPlanMeal.id",
    )


class MealPlanMeal(Base):
    __tablename__ = "meal_plan_meals"
    __table_args__ = {"schema": "plans"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.meal_plans.id"), nullable=False, index=True)
    meal_type: Mapped[str] = mapped_column(String(80), nullable=False)
    time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    plan: Mapped[MealPlan] = relationship(back_populates="meals")
    items: Mapped[list["MealPlanItem"]] = relationship(
        back_populates="meal",
        cascade="all, delete-orphan",
        order_by="MealPlanItem.id",
    )


class MealPlanItem(Base):
    __tablename__ = "meal_plan_items"
    __table_args__ = {"schema": "plans"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    meal_id: Mapped[int] = mapped_column(ForeignKey("plans.meal_plan_meals.id"), nullable=False, index=True)
    food_id: Mapped[Optional[int]] = mapped_column(ForeignKey("foods.foods.id"), nullable=True)
    recipe_id: Mapped[Optional[int]] = mapped_column(ForeignKey("recipes.recipes.id"), nullable=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    unit: Mapped[str] = mapped_column(String(40), nullable=False)
    grams: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    meal: Mapped[MealPlanMeal] = relationship(back_populates="items")
