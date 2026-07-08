"""initial schema

Revision ID: 202607070001
Revises: None
Create Date: 2026-07-07
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "202607070001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SCHEMAS = [
    "core",
    "patients",
    "clinical",
    "nutrition",
    "foods",
    "recipes",
    "assessment",
    "diary",
    "plans",
    "reports",
    "security",
    "logs",
    "analytics",
    "etl",
]


def upgrade() -> None:
    for schema in SCHEMAS:
        op.execute(sa.schema.CreateSchema(schema, if_not_exists=True))

    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute("CREATE EXTENSION IF NOT EXISTS unaccent")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    op.create_table(
        "organizations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("uuid", sa.Uuid(), nullable=False, unique=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        schema="core",
    )

    op.create_table(
        "patients",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("uuid", sa.Uuid(), nullable=False, unique=True),
        sa.Column("full_name", sa.String(160), nullable=False),
        sa.Column("birth_date", sa.Date(), nullable=True),
        sa.Column("gender", sa.String(40), nullable=True),
        sa.Column("email", sa.String(160), nullable=True),
        sa.Column("phone", sa.String(40), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", sa.String(40), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        schema="patients",
    )

    op.create_table(
        "anamnesis",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.patients.id"), nullable=False),
        sa.Column("main_goal", sa.String(240), nullable=True),
        sa.Column("clinical_history", sa.Text(), nullable=True),
        sa.Column("family_history", sa.Text(), nullable=True),
        sa.Column("allergies", sa.Text(), nullable=True),
        sa.Column("intolerances", sa.Text(), nullable=True),
        sa.Column("medications", sa.Text(), nullable=True),
        sa.Column("diseases", sa.Text(), nullable=True),
        sa.Column("surgeries", sa.Text(), nullable=True),
        sa.Column("sleep_quality", sa.String(80), nullable=True),
        sa.Column("stress_level", sa.String(80), nullable=True),
        sa.Column("bowel_function", sa.String(120), nullable=True),
        sa.Column("water_intake", sa.String(80), nullable=True),
        sa.Column("alcohol_use", sa.String(80), nullable=True),
        sa.Column("smoking", sa.String(80), nullable=True),
        sa.Column("physical_activity", sa.Text(), nullable=True),
        sa.Column("food_preferences", sa.Text(), nullable=True),
        sa.Column("food_restrictions", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        schema="clinical",
    )

    op.create_table(
        "physical_assessments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.patients.id"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("weight_kg", sa.Numeric(8, 2), nullable=False),
        sa.Column("height_cm", sa.Numeric(8, 2), nullable=False),
        sa.Column("bmi", sa.Numeric(8, 2), nullable=False),
        sa.Column("waist_cm", sa.Numeric(8, 2), nullable=True),
        sa.Column("hip_cm", sa.Numeric(8, 2), nullable=True),
        sa.Column("arm_cm", sa.Numeric(8, 2), nullable=True),
        sa.Column("calf_cm", sa.Numeric(8, 2), nullable=True),
        sa.Column("body_fat_percent", sa.Numeric(8, 2), nullable=True),
        sa.Column("muscle_mass_kg", sa.Numeric(8, 2), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        schema="assessment",
    )

    op.create_table(
        "bioimpedance",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.patients.id"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("body_fat_percent", sa.Numeric(8, 2), nullable=True),
        sa.Column("fat_mass_kg", sa.Numeric(8, 2), nullable=True),
        sa.Column("lean_mass_kg", sa.Numeric(8, 2), nullable=True),
        sa.Column("muscle_mass_kg", sa.Numeric(8, 2), nullable=True),
        sa.Column("total_body_water_l", sa.Numeric(8, 2), nullable=True),
        sa.Column("basal_metabolic_rate_kcal", sa.Numeric(8, 2), nullable=True),
        sa.Column("visceral_fat_level", sa.Numeric(8, 2), nullable=True),
        sa.Column("metabolic_age", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        schema="assessment",
    )

    op.create_table(
        "food_sources",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("license", sa.String(160), nullable=True),
        sa.Column("url", sa.String(400), nullable=True),
        sa.Column("attribution_required", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("redistribution_allowed", sa.Boolean(), nullable=False, server_default=sa.false()),
        schema="foods",
    )

    op.create_table(
        "foods",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("uuid", sa.Uuid(), nullable=False, unique=True),
        sa.Column("source_id", sa.Integer(), sa.ForeignKey("foods.food_sources.id"), nullable=True),
        sa.Column("external_id", sa.String(120), nullable=True),
        sa.Column("name", sa.String(180), nullable=False),
        sa.Column("normalized_name", sa.String(180), nullable=False),
        sa.Column("original_name", sa.String(240), nullable=True),
        sa.Column("source_locale", sa.String(20), nullable=True),
        sa.Column("scientific_name", sa.String(180), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(120), nullable=True),
        sa.Column("image_url", sa.String(400), nullable=True),
        sa.Column("verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        schema="foods",
    )

    op.create_index("ix_foods_normalized_name_trgm", "foods", ["normalized_name"], schema="foods", postgresql_using="gin", postgresql_ops={"normalized_name": "gin_trgm_ops"})

    op.create_table(
        "nutrients",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(40), nullable=False, unique=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("unit", sa.String(20), nullable=False),
        sa.Column("nutrient_group", sa.String(80), nullable=True),
        schema="nutrition",
    )

    op.create_table(
        "food_nutrients",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("food_id", sa.Integer(), sa.ForeignKey("foods.foods.id"), nullable=False),
        sa.Column("nutrient_id", sa.Integer(), sa.ForeignKey("nutrition.nutrients.id"), nullable=False),
        sa.Column("amount_per_100g", sa.Numeric(12, 4), nullable=False),
        schema="nutrition",
    )

    op.create_table(
        "food_aliases",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("food_id", sa.Integer(), sa.ForeignKey("foods.foods.id"), nullable=False),
        sa.Column("alias", sa.String(180), nullable=False),
        sa.Column("normalized_alias", sa.String(180), nullable=False),
        schema="foods",
    )

    op.create_table(
        "serving_measures",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("food_id", sa.Integer(), sa.ForeignKey("foods.foods.id"), nullable=False),
        sa.Column("description", sa.String(160), nullable=False),
        sa.Column("gram_weight", sa.Numeric(10, 2), nullable=False),
        sa.Column("household_measure", sa.String(160), nullable=True),
        schema="foods",
    )

    op.create_table(
        "recipes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("uuid", sa.Uuid(), nullable=False, unique=True),
        sa.Column("title", sa.String(180), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("preparation_method", sa.Text(), nullable=True),
        sa.Column("prep_time_minutes", sa.Integer(), nullable=True),
        sa.Column("cook_time_minutes", sa.Integer(), nullable=True),
        sa.Column("servings", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("raw_weight_g", sa.Numeric(10, 2), nullable=True),
        sa.Column("cooked_weight_g", sa.Numeric(10, 2), nullable=True),
        sa.Column("yield_weight_g", sa.Numeric(10, 2), nullable=True),
        sa.Column("image_url", sa.String(400), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("professional_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        schema="recipes",
    )

    op.create_table(
        "recipe_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("recipe_id", sa.Integer(), sa.ForeignKey("recipes.recipes.id"), nullable=False),
        sa.Column("food_id", sa.Integer(), sa.ForeignKey("foods.foods.id"), nullable=False),
        sa.Column("quantity", sa.Numeric(10, 2), nullable=False),
        sa.Column("unit", sa.String(40), nullable=False),
        sa.Column("grams", sa.Numeric(10, 2), nullable=False),
        schema="recipes",
    )

    op.create_table(
        "meal_plans",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.patients.id"), nullable=False),
        sa.Column("title", sa.String(180), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("target_kcal", sa.Numeric(10, 2), nullable=True),
        sa.Column("target_protein_g", sa.Numeric(10, 2), nullable=True),
        sa.Column("target_carbs_g", sa.Numeric(10, 2), nullable=True),
        sa.Column("target_fat_g", sa.Numeric(10, 2), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        schema="plans",
    )

    op.create_table(
        "meal_plan_meals",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("plan_id", sa.Integer(), sa.ForeignKey("plans.meal_plans.id"), nullable=False),
        sa.Column("meal_type", sa.String(80), nullable=False),
        sa.Column("time", sa.Time(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        schema="plans",
    )

    op.create_table(
        "meal_plan_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("meal_id", sa.Integer(), sa.ForeignKey("plans.meal_plan_meals.id"), nullable=False),
        sa.Column("food_id", sa.Integer(), sa.ForeignKey("foods.foods.id"), nullable=True),
        sa.Column("recipe_id", sa.Integer(), sa.ForeignKey("recipes.recipes.id"), nullable=True),
        sa.Column("quantity", sa.Numeric(10, 2), nullable=False),
        sa.Column("unit", sa.String(40), nullable=False),
        sa.Column("grams", sa.Numeric(10, 2), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        schema="plans",
    )

    op.create_table(
        "food_diary_entries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.patients.id"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("meal_type", sa.String(80), nullable=False),
        sa.Column("food_id", sa.Integer(), sa.ForeignKey("foods.foods.id"), nullable=True),
        sa.Column("recipe_id", sa.Integer(), sa.ForeignKey("recipes.recipes.id"), nullable=True),
        sa.Column("quantity", sa.Numeric(10, 2), nullable=False),
        sa.Column("grams", sa.Numeric(10, 2), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        schema="diary",
    )

    op.create_table(
        "import_jobs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("source_name", sa.String(120), nullable=False),
        sa.Column("source_version", sa.String(120), nullable=True),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        schema="etl",
    )

    op.create_table(
        "import_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("job_id", sa.Integer(), sa.ForeignKey("etl.import_jobs.id"), nullable=False),
        sa.Column("level", sa.String(20), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        schema="etl",
    )


def downgrade() -> None:
    op.drop_table("import_logs", schema="etl")
    op.drop_table("import_jobs", schema="etl")
    op.drop_table("food_diary_entries", schema="diary")
    op.drop_table("meal_plan_items", schema="plans")
    op.drop_table("meal_plan_meals", schema="plans")
    op.drop_table("meal_plans", schema="plans")
    op.drop_table("recipe_items", schema="recipes")
    op.drop_table("recipes", schema="recipes")
    op.drop_table("serving_measures", schema="foods")
    op.drop_table("food_aliases", schema="foods")
    op.drop_table("food_nutrients", schema="nutrition")
    op.drop_table("nutrients", schema="nutrition")
    op.drop_index("ix_foods_normalized_name_trgm", table_name="foods", schema="foods")
    op.drop_table("foods", schema="foods")
    op.drop_table("food_sources", schema="foods")
    op.drop_table("bioimpedance", schema="assessment")
    op.drop_table("physical_assessments", schema="assessment")
    op.drop_table("anamnesis", schema="clinical")
    op.drop_table("patients", schema="patients")
    op.drop_table("organizations", schema="core")

    for schema in reversed(SCHEMAS):
        op.execute(sa.schema.DropSchema(schema, if_exists=True))
