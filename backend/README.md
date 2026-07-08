# SmartDiet Backend

Backend FastAPI da plataforma SmartDiet - Inteligencia Nutricional.

## Requisitos

- Python 3.13
- PostgreSQL 17

## Desenvolvimento local

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Swagger: `http://localhost:8000/docs`

Health check: `GET /api/v1/health`

## Migrações

```bash
alembic upgrade head
```

## Endpoints iniciais

- `GET /api/v1/health`
- `GET /api/v1/dashboard/summary`
- `GET|POST /api/v1/patients`
- `GET|PUT|DELETE /api/v1/patients/{patient_id}`
- `GET|POST /api/v1/patients/{patient_id}/anamnesis`
- `GET|POST /api/v1/patients/{patient_id}/assessments`
- `GET|POST /api/v1/patients/{patient_id}/bioimpedance`
- `GET|POST /api/v1/foods`
- `GET /api/v1/foods/search?q=`
- `GET /api/v1/foods/brazilian/search?q=`
- `GET /api/v1/foods/{food_id}/nutrients`
- `POST /api/v1/nutrition/energy-target`
- `POST /api/v1/nutrition/macro-targets`
- `POST /api/v1/nutrition/meal-plan/analyze`
- `POST /api/v1/nutrition/substitutions/equivalent`
- `POST /api/v1/nutrition/clinical-alerts`
- `GET|POST /api/v1/recipes`
- `POST /api/v1/recipes/{recipe_id}/calculate`
- `GET|POST /api/v1/patients/{patient_id}/meal-plans`
- `GET /api/v1/meal-plans/{plan_id}`
- `GET|POST /api/v1/patients/{patient_id}/diary`
- `GET /api/v1/patients/{patient_id}/reports/summary`
- `POST /api/v1/etl/open-food-facts/import`

## ETL alimentar

O importador inicial usa Open Food Facts para produtos industrializados, com `User-Agent`
identificando o SmartDiet e importacao por busca. Os dados entram como `verified=false`
para revisao profissional.

Exemplo:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/etl/open-food-facts/import ^
  -H "Content-Type: application/json" ^
  -d "{\"query\":\"iogurte\",\"page_size\":10,\"country\":\"br\"}"
```

Para USDA FoodData Central, o backend ja possui um mapa controlado de nutrientes e
nomes comuns em `app/etl/usda_translation.py`, mantendo o nome original em ingles
se ainda nao houver traducao revisada.

## Testes

```bash
pytest
```
