# API - SmartDiet

## Base
`/api/v1`

## Health
- `GET /api/v1/health`

## Auth
- `GET /api/v1/auth/session`

Retorna a sessao atual. Na Beta inicial, quando `AUTH_ENABLED=false`, retorna
um usuario beta autenticado para manter o produto testavel sem login obrigatorio.

## Dashboard
- `GET /api/v1/dashboard/summary`

## Pacientes
- `GET /api/v1/patients`
- `POST /api/v1/patients`
- `GET /api/v1/patients/{patient_id}`
- `PUT /api/v1/patients/{patient_id}`
- `DELETE /api/v1/patients/{patient_id}`

## Anamnese
- `GET /api/v1/patients/{patient_id}/anamnesis`
- `POST /api/v1/patients/{patient_id}/anamnesis`

## Avaliacoes
- `GET /api/v1/patients/{patient_id}/assessments`
- `POST /api/v1/patients/{patient_id}/assessments`
- `PUT /api/v1/patients/{patient_id}/assessments/{assessment_id}`
- `DELETE /api/v1/patients/{patient_id}/assessments/{assessment_id}`

## Bioimpedancia
- `GET /api/v1/patients/{patient_id}/bioimpedance`
- `POST /api/v1/patients/{patient_id}/bioimpedance`
- `PUT /api/v1/patients/{patient_id}/bioimpedance/{bioimpedance_id}`
- `DELETE /api/v1/patients/{patient_id}/bioimpedance/{bioimpedance_id}`

## Alimentos
- `GET /api/v1/foods`
- `GET /api/v1/foods/search?q=`
- `GET /api/v1/foods/brazilian`
- `GET /api/v1/foods/brazilian/search?q=`
- `GET /api/v1/foods/{food_id}`
- `GET /api/v1/foods/{food_id}/nutrients`

As rotas brasileiras retornam fontes nacionais unificadas no mesmo formato:
TACO 4a edicao, TBCA e futuras tabelas importadas para o catalogo local.

## Motor nutricional
- `POST /api/v1/nutrition/energy-target`
- `POST /api/v1/nutrition/macro-targets`
- `POST /api/v1/nutrition/meal-plan/analyze`
- `POST /api/v1/nutrition/substitutions/equivalent`
- `POST /api/v1/nutrition/clinical-alerts`

## Receitas
- `GET /api/v1/recipes`
- `POST /api/v1/recipes`
- `GET /api/v1/recipes/{recipe_id}`
- `PUT /api/v1/recipes/{recipe_id}`
- `DELETE /api/v1/recipes/{recipe_id}`
- `POST /api/v1/recipes/{recipe_id}/calculate`

## Plano alimentar
- `GET /api/v1/patients/{patient_id}/meal-plans`
- `POST /api/v1/patients/{patient_id}/meal-plans`
- `GET /api/v1/meal-plans/{plan_id}`

Os endpoints de leitura retornam o plano com `meals[]` e `items[]`, incluindo
refeicao, horario, observacoes, quantidade, unidade, gramas e referencia por
`food_id`, `recipe_id` ou nota textual para catalogos locais ainda nao
materializados no banco.

## Diario alimentar
- `GET /api/v1/patients/{patient_id}/diary`
- `POST /api/v1/patients/{patient_id}/diary`
- `PUT /api/v1/patients/{patient_id}/diary/{entry_id}`
- `DELETE /api/v1/patients/{patient_id}/diary/{entry_id}`

## Relatorios
- `GET /api/v1/patients/{patient_id}/reports/summary`
- `GET /api/v1/patients/{patient_id}/reports/meal-plan.pdf`
- `GET /api/v1/patients/{patient_id}/reports/clinical-summary.pdf`

## Padrao de resposta
```json
{
  "data": {},
  "meta": {},
  "errors": []
}
```

## Erros
- 400 validacao de regra de negocio.
- 404 recurso nao encontrado.
- 422 erro de validacao.
- 500 erro interno.
