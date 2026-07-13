"""associate recipes with patients

Revision ID: 202607130001
Revises: 202607080002
Create Date: 2026-07-13
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "202607130001"
down_revision: str | None = "202607080002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("recipes", sa.Column("patient_id", sa.Integer(), nullable=True), schema="recipes")
    op.create_foreign_key(
        "fk_recipes_patient_id_patients",
        "recipes",
        "patients",
        ["patient_id"],
        ["id"],
        source_schema="recipes",
        referent_schema="patients",
        ondelete="CASCADE",
    )
    op.create_index("ix_recipes_recipes_patient_id", "recipes", ["patient_id"], schema="recipes")
    op.execute(
        """
        UPDATE recipes.recipes
        SET patient_id = (SELECT min(id) FROM patients.patients)
        WHERE patient_id IS NULL
        """
    )
    patient_links = [
        ("clinical", "anamnesis", "fk_anamnesis_patient_id_patients"),
        ("assessment", "physical_assessments", "fk_physical_assessments_patient_id_patients"),
        ("assessment", "bioimpedance", "fk_bioimpedance_patient_id_patients"),
        ("plans", "meal_plans", "fk_meal_plans_patient_id_patients"),
        ("diary", "food_diary_entries", "fk_food_diary_entries_patient_id_patients"),
        ("clinical", "patient_goals", "fk_patient_goals_patient_id_patients"),
    ]
    for schema, table, constraint in patient_links:
        op.drop_constraint(constraint, table, schema=schema, type_="foreignkey")
        op.create_foreign_key(
            constraint,
            table,
            "patients",
            ["patient_id"],
            ["id"],
            source_schema=schema,
            referent_schema="patients",
            ondelete="CASCADE",
        )

    aggregate_links = [
        ("plans", "meal_plan_meals", "fk_meal_plan_meals_plan_id_meal_plans", "plan_id", "meal_plans", "id", "plans"),
        ("plans", "meal_plan_items", "fk_meal_plan_items_meal_id_meal_plan_meals", "meal_id", "meal_plan_meals", "id", "plans"),
        ("recipes", "recipe_items", "fk_recipe_items_recipe_id_recipes", "recipe_id", "recipes", "id", "recipes"),
    ]
    for schema, table, constraint, column, target, target_column, target_schema in aggregate_links:
        op.drop_constraint(constraint, table, schema=schema, type_="foreignkey")
        op.create_foreign_key(
            constraint,
            table,
            target,
            [column],
            [target_column],
            source_schema=schema,
            referent_schema=target_schema,
            ondelete="CASCADE",
        )


def downgrade() -> None:
    aggregate_links = [
        ("plans", "meal_plan_meals", "fk_meal_plan_meals_plan_id_meal_plans", "plan_id", "meal_plans", "plans"),
        ("plans", "meal_plan_items", "fk_meal_plan_items_meal_id_meal_plan_meals", "meal_id", "meal_plan_meals", "plans"),
        ("recipes", "recipe_items", "fk_recipe_items_recipe_id_recipes", "recipe_id", "recipes", "recipes"),
    ]
    for schema, table, constraint, column, target, target_schema in aggregate_links:
        op.drop_constraint(constraint, table, schema=schema, type_="foreignkey")
        op.create_foreign_key(
            constraint,
            table,
            target,
            [column],
            ["id"],
            source_schema=schema,
            referent_schema=target_schema,
        )

    patient_links = [
        ("clinical", "anamnesis", "fk_anamnesis_patient_id_patients"),
        ("assessment", "physical_assessments", "fk_physical_assessments_patient_id_patients"),
        ("assessment", "bioimpedance", "fk_bioimpedance_patient_id_patients"),
        ("plans", "meal_plans", "fk_meal_plans_patient_id_patients"),
        ("diary", "food_diary_entries", "fk_food_diary_entries_patient_id_patients"),
        ("clinical", "patient_goals", "fk_patient_goals_patient_id_patients"),
    ]
    for schema, table, constraint in patient_links:
        op.drop_constraint(constraint, table, schema=schema, type_="foreignkey")
        op.create_foreign_key(
            constraint,
            table,
            "patients",
            ["patient_id"],
            ["id"],
            source_schema=schema,
            referent_schema="patients",
        )
    op.drop_index("ix_recipes_recipes_patient_id", table_name="recipes", schema="recipes")
    op.drop_constraint("fk_recipes_patient_id_patients", "recipes", schema="recipes", type_="foreignkey")
    op.drop_column("recipes", "patient_id", schema="recipes")
