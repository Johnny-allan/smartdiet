# Banco de Dados — SmartDiet

## Banco oficial
PostgreSQL 17.

## Schemas
- core
- patients
- clinical
- nutrition
- foods
- recipes
- assessment
- diary
- reports
- security
- logs
- analytics
- etl

## Tabelas iniciais recomendadas

### core.organizations
Preparada para multiempresa futura, mesmo que Beta use uma organização padrão.

### patients.patients
Dados principais do paciente.

Campos sugeridos:
- id
- uuid
- full_name
- birth_date
- gender
- email
- phone
- notes
- created_at
- updated_at

### clinical.anamnesis
Anamnese completa.

Campos principais:
- patient_id
- main_goal
- clinical_history
- family_history
- allergies
- intolerances
- medications
- diseases
- surgeries
- sleep_quality
- stress_level
- bowel_function
- water_intake
- alcohol_use
- smoking
- physical_activity
- food_preferences
- food_restrictions

### assessment.physical_assessments
- patient_id
- date
- weight_kg
- height_cm
- bmi
- waist_cm
- hip_cm
- arm_cm
- body_fat_percent
- muscle_mass_kg
- notes

### assessment.bioimpedance
- patient_id
- date
- body_fat_percent
- fat_mass_kg
- lean_mass_kg
- muscle_mass_kg
- total_body_water_l
- basal_metabolic_rate_kcal
- visceral_fat_level
- metabolic_age
- notes

### foods.foods
- id
- uuid
- source_id
- external_id
- name
- normalized_name
- scientific_name
- description
- category_id
- image_url
- verified
- created_at
- updated_at

### foods.food_sources
- id
- name
- license
- url
- attribution_required
- redistribution_allowed

### nutrition.nutrients
- id
- code
- name
- unit
- nutrient_group

### nutrition.food_nutrients
- food_id
- nutrient_id
- amount_per_100g

### foods.food_aliases
- food_id
- alias
- normalized_alias

### foods.serving_measures
- food_id
- description
- gram_weight
- household_measure

### recipes.recipes
- id
- patient_id
- uuid
- title
- description
- preparation_method
- prep_time_minutes
- cook_time_minutes
- servings
- raw_weight_g
- cooked_weight_g
- yield_weight_g
- image_url

### recipes.recipe_items
- recipe_id
- food_id
- quantity
- unit
- grams

### recipes.recipe_nutrients
Resultado calculado por receita e por porção.

### diary.food_diary_entries
- patient_id
- date
- meal_type
- food_id nullable
- recipe_id nullable
- quantity
- grams
- notes

### plans.meal_plans
- patient_id
- title
- start_date
- end_date
- target_kcal
- target_protein_g
- target_carbs_g
- target_fat_g
- notes

### plans.meal_plan_meals
- plan_id
- meal_type
- time
- notes

### plans.meal_plan_items
- meal_id
- food_id nullable
- recipe_id nullable
- quantity
- grams
- notes

## Busca
Ativar extensões:
```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Índices:
- GIN em nomes normalizados.
- Trigram para busca tolerante a erros.
- B-tree em chaves estrangeiras.

## Fontes de alimentos
- TBCA: integrar respeitando termos de uso.
- TACO: verificar licença e forma legal de uso.
- Open Food Facts: ODbL, útil para industrializados.
- USDA FoodData Central: fonte pública ampla, útil como complemento.

Não redistribuir bases restritivas sem autorização.
