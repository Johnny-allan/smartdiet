# Padrões de Código — SmartDiet

## Backend
- Python 3.13.
- Tipagem obrigatória sempre que possível.
- FastAPI com routers separados por módulo.
- SQLAlchemy 2.
- Pydantic para schemas.
- Repository Pattern para acesso a dados.
- Services para regras de negócio.
- Testes com pytest.

## Frontend
- TypeScript obrigatório.
- Componentes pequenos e reutilizáveis.
- Tailwind usando tokens do Design System.
- Nunca usar cores hex diretamente em componentes finais.
- Separar UI, hooks e chamadas de API.

## Commits sugeridos
- `feat:` nova funcionalidade.
- `fix:` correção.
- `docs:` documentação.
- `refactor:` refatoração.
- `test:` testes.
- `chore:` manutenção.

## Qualidade
- Não duplicar lógica.
- Não criar arquivos gigantes.
- Não misturar regra clínica no frontend.
- Não implementar recursos fora do escopo sem documentação.
