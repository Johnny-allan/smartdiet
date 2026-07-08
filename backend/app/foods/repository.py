from __future__ import annotations

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.foods.models import Food, FoodAlias, FoodNutrient, FoodSource, Nutrient, ServingMeasure
from app.foods.schemas import FoodCreate
from app.shared.nutrition import normalize_text


class FoodRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Food]:
        return list(self.db.scalars(select(Food).order_by(Food.name)))

    def get(self, food_id: int) -> Food | None:
        return self.db.get(Food, food_id)

    def get_by_source_external_id(self, source_name: str, external_id: str) -> Food | None:
        stmt = (
            select(Food)
            .join(FoodSource, Food.source_id == FoodSource.id)
            .where(FoodSource.name == source_name, Food.external_id == external_id)
        )
        return self.db.scalar(stmt)

    def search(self, query: str) -> list[Food]:
        normalized = f"%{normalize_text(query)}%"
        food_ids_by_alias = select(FoodAlias.food_id).where(FoodAlias.normalized_alias.ilike(normalized))
        stmt = (
            select(Food)
            .where(or_(Food.normalized_name.ilike(normalized), Food.id.in_(food_ids_by_alias)))
            .order_by(Food.name)
        )
        return list(self.db.scalars(stmt))

    def create(self, data: FoodCreate) -> Food:
        source_id = None
        if data.source_name:
            source = self.db.scalar(select(FoodSource).where(FoodSource.name == data.source_name))
            if source is None:
                source = FoodSource(name=data.source_name)
                self.db.add(source)
                self.db.flush()
            source_id = source.id

        food = Food(
            source_id=source_id,
            external_id=data.external_id,
            name=data.name,
            normalized_name=normalize_text(data.name),
            original_name=data.original_name,
            source_locale=data.source_locale,
            scientific_name=data.scientific_name,
            description=data.description,
            category=data.category,
            image_url=data.image_url,
            verified=data.verified,
        )
        self.db.add(food)
        self.db.flush()

        for alias in data.aliases:
            self.db.add(FoodAlias(food_id=food.id, alias=alias, normalized_alias=normalize_text(alias)))

        for item in data.nutrients:
            nutrient = self.db.scalar(select(Nutrient).where(Nutrient.code == item.nutrient_code))
            if nutrient is None:
                nutrient = Nutrient(
                    code=item.nutrient_code,
                    name=item.nutrient_name,
                    unit=item.unit,
                    nutrient_group=item.nutrient_group,
                )
                self.db.add(nutrient)
                self.db.flush()
            self.db.add(
                FoodNutrient(
                    food_id=food.id,
                    nutrient_id=nutrient.id,
                    amount_per_100g=item.amount_per_100g,
                )
            )

        for measure in data.serving_measures:
            self.db.add(ServingMeasure(food_id=food.id, **measure.model_dump()))

        self.db.commit()
        self.db.refresh(food)
        return food

    def aliases_for(self, food_id: int) -> list[str]:
        return list(self.db.scalars(select(FoodAlias.alias).where(FoodAlias.food_id == food_id)))

    def nutrients_for(self, food_id: int) -> list[tuple[Nutrient, FoodNutrient]]:
        stmt = (
            select(Nutrient, FoodNutrient)
            .join(FoodNutrient, Nutrient.id == FoodNutrient.nutrient_id)
            .where(FoodNutrient.food_id == food_id)
            .order_by(Nutrient.name)
        )
        return list(self.db.execute(stmt).all())

    def measures_for(self, food_id: int) -> list[ServingMeasure]:
        return list(self.db.scalars(select(ServingMeasure).where(ServingMeasure.food_id == food_id)))
