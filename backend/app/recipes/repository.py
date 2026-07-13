from __future__ import annotations

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.foods.models import FoodNutrient, Nutrient
from app.recipes.models import Recipe, RecipeItem
from app.recipes.schemas import RecipeCreate, RecipeUpdate


class RecipeRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_by_patient(self, patient_id: int) -> list[Recipe]:
        return list(
            self.db.scalars(
                select(Recipe)
                .where(Recipe.patient_id == patient_id)
                .order_by(Recipe.title)
            )
        )

    def get(self, recipe_id: int) -> Recipe | None:
        return self.db.get(Recipe, recipe_id)

    def create(self, patient_id: int, data: RecipeCreate) -> Recipe:
        recipe_data = data.model_dump(exclude={"items"})
        recipe = Recipe(patient_id=patient_id, **recipe_data)
        self.db.add(recipe)
        self.db.flush()
        for item in data.items:
            self.db.add(RecipeItem(recipe_id=recipe.id, **item.model_dump()))
        self.db.commit()
        self.db.refresh(recipe)
        return recipe

    def update(self, recipe: Recipe, data: RecipeUpdate) -> Recipe:
        recipe_data = data.model_dump(exclude={"items"})
        for field, value in recipe_data.items():
            setattr(recipe, field, value)

        self.db.execute(delete(RecipeItem).where(RecipeItem.recipe_id == recipe.id))
        for item in data.items:
            self.db.add(RecipeItem(recipe_id=recipe.id, **item.model_dump()))

        self.db.commit()
        self.db.refresh(recipe)
        return recipe

    def delete(self, recipe: Recipe) -> None:
        self.db.execute(delete(RecipeItem).where(RecipeItem.recipe_id == recipe.id))
        self.db.delete(recipe)
        self.db.commit()

    def items_for(self, recipe_id: int) -> list[RecipeItem]:
        return list(self.db.scalars(select(RecipeItem).where(RecipeItem.recipe_id == recipe_id)))

    def nutrients_for_food(self, food_id: int) -> list[tuple[str, FoodNutrient]]:
        stmt = (
            select(Nutrient.code, FoodNutrient)
            .join(FoodNutrient, Nutrient.id == FoodNutrient.nutrient_id)
            .where(FoodNutrient.food_id == food_id)
        )
        return list(self.db.execute(stmt).all())
