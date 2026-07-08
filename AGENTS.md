# AGENTS.md — SmartDiet

## Papel do agente
Você está trabalhando no projeto **SmartDiet — Inteligência Nutricional**, uma plataforma web profissional para nutricionistas. O projeto não é experimental. Todo código deve ser tratado como código de produto comercial.

## Objetivo
Desenvolver uma plataforma web SaaS para nutrição clínica, inicialmente gratuita em versão Beta, sem mobile e sem pagamentos nesta fase.

## Stack obrigatória
- Backend: Python 3.13, FastAPI, SQLAlchemy 2, Alembic, Pydantic.
- Banco: PostgreSQL 17.
- Cache/filas futuros: Redis, Celery.
- Frontend: Next.js, React, TypeScript, Tailwind CSS.
- API: REST, versionada em `/api/v1`.
- Documentação: OpenAPI/Swagger e Markdown.

## Regras gerais
1. Não usar Bootstrap.
2. Não copiar Tecnonutri, Dietbox, Nutrium ou qualquer solução existente.
3. Seguir o Design System do SmartDiet.
4. Não implementar mobile agora.
5. Não implementar pagamentos agora.
6. Não exigir login na fase Beta inicial, mas preparar arquitetura para autenticação futura.
7. Nunca acessar banco diretamente pelo frontend.
8. Toda regra de negócio deve ficar no backend.
9. Priorizar código limpo, tipado, modular e testável.
10. Criar testes para cálculos nutricionais, regras clínicas e importações.
11. Manter LGPD em mente desde o início.
12. Não redistribuir bases restritivas; criar ETL/importadores legais por fonte.

## Identidade oficial
- Nome: SmartDiet
- Slogan: Inteligência Nutricional
- Logo: letra "S" integrada a uma folha.
- Estilo: SaaS premium, natural, limpo, moderno e profissional.

## Paleta oficial
- Verde Floresta: `#2F6F4F`
- Sálvia: `#A8D5BA`
- Terracota: `#C86A3A`
- Azul Petróleo: `#2E5D66`
- Fundo premium: `#F8F8F4`
- Texto grafite: `#374151`

## Princípios de produto
- Resolver problemas reais do nutricionista.
- Reduzir cliques.
- Busca rápida e inteligente.
- Interface limpa, sem poluição visual.
- IA como apoio invisível, nunca como substituta do nutricionista.
- Performance percebida de produto premium.

## Estrutura esperada
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

## Antes de implementar
Sempre leia:
- `docs/product/VISION.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/design/DESIGN_SYSTEM.md`
- `docs/database/DATABASE.md`
- `docs/api/API.md`
- `docs/development/CODING_STANDARDS.md`
