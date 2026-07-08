# Deploy - SmartDiet

## Estado
O projeto esta preparado para preview/local containerizado. Antes de producao
real, revise segredos, dominio, HTTPS, backups, logs e autenticacao.

## Variaveis essenciais
Backend:
- `ENVIRONMENT`
- `DATABASE_URL`
- `SECRET_KEY`
- `AUTH_ENABLED`
- `BETA_USER_EMAIL`
- `BETA_USER_NAME`
- `CORS_ORIGINS`

Frontend:
- `NEXT_PUBLIC_API_BASE_URL`

## Docker local
```bash
docker compose up --build
```

Servicos esperados:
- Frontend: `http://127.0.0.1:3000`
- Backend: `http://127.0.0.1:8000`
- API docs: `http://127.0.0.1:8000/docs`

## Migracoes
Execute antes de expor ambiente persistente:
```bash
docker compose exec backend alembic upgrade head
```

## Checklist de producao
- Trocar `SECRET_KEY`.
- Definir `AUTH_ENABLED=true` quando login real estiver implementado.
- Restringir `CORS_ORIGINS` ao dominio oficial.
- Usar PostgreSQL gerenciado ou volume com backup testado.
- Habilitar HTTPS no proxy/plataforma.
- Configurar logs sem dados sensiveis.
- Definir rotina de backup e restore.
- Revisar termos de TACO/TBCA antes de distribuir dados embarcados.
- Rodar `npm.cmd run test`, `npm.cmd run test:ui`, `npm.cmd run build` e
  `.venv\Scripts\python -m pytest` antes de release.
