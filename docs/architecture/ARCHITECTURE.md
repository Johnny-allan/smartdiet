# Arquitetura — SmartDiet

## Estilo arquitetural
Modular monolith API-first.

Motivo: permite desenvolvimento rápido e organizado no início, com separação clara por domínio e possibilidade de extração futura para serviços separados se necessário.

## Estrutura raiz
```
smartdiet/
  backend/
  frontend/
  database/
  etl/
  docs/
  docker/
  scripts/
  tests/
  branding/
```

## Backend
```
backend/
  app/
    core/
    patients/
    clinical/
    assessment/
    foods/
    recipes/
    plans/
    diary/
    reports/
    analytics/
    etl/
    shared/
  alembic/
  tests/
  requirements.txt
```

Cada módulo deve conter, quando necessário:
```
models.py
schemas.py
repository.py
service.py
router.py
exceptions.py
```

## Frontend
```
frontend/
  src/
    app/
    modules/
      dashboard/
      patients/
      foods/
      recipes/
      plans/
      diary/
      assessments/
      reports/
    shared/
      components/
      layout/
      styles/
      hooks/
      utils/
      types/
```

## Banco de dados
PostgreSQL com schemas por domínio:
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
- etl

## API
Toda API deve ser versionada em `/api/v1`.

Exemplos:
- `/api/v1/patients`
- `/api/v1/foods`
- `/api/v1/recipes`
- `/api/v1/plans`
- `/api/v1/diary`
- `/api/v1/assessments`

## Princípios
- Frontend nunca acessa banco diretamente.
- Backend concentra regra de negócio.
- Repositories acessam dados.
- Services executam regras.
- Routers expõem HTTP.
- Schemas validam entrada e saída.
