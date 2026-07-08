# Prompts recomendados para Codex

## Inicialização
Leia `AGENTS.md` e toda a pasta `docs`. Depois crie a estrutura inicial do projeto SmartDiet seguindo exatamente a arquitetura documentada. Não implemente mobile nem pagamentos.

## Backend inicial
Implemente o backend FastAPI em `backend/` com `/api/v1/health`, estrutura modular, configuração, CORS, routers iniciais e Swagger funcionando.

## Frontend inicial
Implemente o frontend Next.js em `frontend/` com AppShell, Sidebar, Header, tema SmartDiet, Dashboard inicial e componentes do Design System.

## Banco inicial
Crie migrações Alembic para schemas e tabelas iniciais de pacientes, alimentos, nutrientes, receitas, plano alimentar e diário.

## Módulo pacientes
Implemente CRUD de pacientes seguindo `docs/modules/PATIENTS_SPEC.md`, com backend, frontend, validação e testes.

## Módulo alimentos
Implemente banco de alimentos seguindo `docs/modules/FOODS_SPEC.md`, com busca por nome, sinônimos e nutrientes básicos.

## Plano alimentar
Implemente plano alimentar seguindo `docs/modules/MEAL_PLAN_SPEC.md`, com 6 refeições obrigatórias e resumo nutricional diário.
