# Status de Implementacao - SmartDiet

## Estado atual
Base Beta inicial com backend FastAPI e frontend Next.js funcionando localmente.

## Backend implementado
- FastAPI com API versionada em `/api/v1`.
- Padrao de resposta `data`, `meta`, `errors`.
- Tratamento padronizado de erros.
- SQLAlchemy 2 e Alembic.
- Migração inicial com schemas PostgreSQL.
- Health check.
- Dashboard summary.
- Pacientes.
- Anamnese.
- Avaliacoes fisicas com IMC calculado.
- Bioimpedancia.
- Alimentos com nutrientes, aliases e medidas caseiras.
- Receitas com calculo nutricional.
- Plano alimentar com validacao das 6 refeicoes obrigatorias.
- Diario alimentar.
- Relatorios summary.
- Fallback local TACO e TBCA para busca brasileira de alimentos.
  - TACO: 597 itens.
  - TBCA: 5.875 itens indexados a partir das paginas publicas oficiais, com
    nutrientes detalhados baixados inicialmente para 500 itens.
  - Total exposto pela API brasileira: 6.472 itens.
- Endpoint brasileiro `/api/v1/foods/brazilian/search` com multiplas fontes nacionais.
- Motor nutricional no backend como fonte da verdade:
  - Gasto energetico por Mifflin, Harris-Benedict e Cunningham.
  - Metas de macros por objetivo.
  - Analise de plano alimentar por refeicao e total diario.
  - Substituicao equivalente por kcal, carboidrato ou proteina.
  - Alertas clinicos iniciais para sodio, fibra, diabetes e renal.

## Frontend implementado
- Next.js, React, TypeScript e Tailwind.
- Design System SmartDiet com tokens oficiais.
- Logo "S" com folha em CSS.
- AppShell com sidebar, header e dashboard.
- Navegacao real por rotas.
- Abas/telas:
  - Dashboard
  - Pacientes
  - Anamnese
  - Avaliacoes
  - Bioimpedancia
  - Alimentos
  - Receitas
  - Plano alimentar
  - Diario
  - Relatorios
  - ETL

## Decisoes de produto
- Substituicoes nao ficam como modulo principal isolado na navegacao.
- Substituicoes ficam dentro do fluxo de Plano Alimentar, onde o nutricionista
  realmente faz trocas e ajustes de prescricao.
- O botao "Novo paciente" leva para a tela funcional de cadastro de pacientes.
- A busca central consulta pacientes, alimentos, receitas e avaliacoes salvos
  no workspace local.
- A base alimentar da prescricao usa fonte brasileira primeiro. A TACO 4a edicao
  foi materializada como catalogo local e a TBCA foi obtida das paginas
  publicas oficiais como segunda tabela brasileira para evitar bloqueio quando
  API externa de alimentos nao responder.
- Substituicoes acompanham a prescricao: o nutricionista escolhe o alimento
  base, informa a quantidade em gramas e revisa alternativas com kcal,
  carboidratos, proteinas e gorduras antes de inserir no plano.
- Calculos nutricionais criticos pertencem ao backend. O frontend deve consumir
  os endpoints `/api/v1/nutrition/*` em vez de manter regra clinica propria.
- A tela de Plano Alimentar ja possui uma secao estruturada que consulta o
  motor nutricional do backend para meta energetica, macros, analise diaria e
  alertas clinicos iniciais.
- A API de Plano Alimentar retorna refeicoes e itens estruturados, e o
  salvamento da tela grava localmente na Beta e chama o endpoint persistente
  quando o paciente vem do backend com ID numerico.
- A tela de Pacientes tenta cadastrar e listar pacientes pela API real; se a
  API estiver indisponivel, mantem fallback local da Beta.
- As telas de Alimentos, Receitas, Anamnese, Avaliacoes, Bioimpedancia e Diario
  tambem tentam carregar/salvar pela API real, mantendo fallback local para uso
  offline da Beta.
- O Diario Alimentar aceita registro textual no backend quando alimento/receita
  ainda nao foi materializado no banco, preservando compatibilidade com o
  catalogo local.
- A tela de Anamnese foi transformada em entrevista guiada: possui objetivos
  frequentes de mercado, condicoes clinicas, preferencias alimentares, rotina,
  sinais de estilo de vida, planejamento sugerido e cardapio inicial que pode
  ser aplicado diretamente ao Plano Alimentar para revisao do profissional.
- A tela de Alimentos agora integra TACO, TBCA e cadastro
  local/PostgreSQL, com filtro por fonte, busca unificada e botao Limpar
  funcional.
- A tela de Pacientes agora permite editar e remover pacientes. Pacientes com
  ID numerico sincronizam edicao/exclusao com a API real; pacientes locais
  continuam gerenciaveis no workspace Beta.
- Receitas, avaliacoes, bioimpedancia e diario alimentar agora possuem
  edicao/exclusao no frontend. Quando os registros possuem ID numerico e a API
  esta disponivel, as alteracoes usam endpoints reais de `PUT`/`DELETE`;
  registros locais continuam funcionando no workspace Beta.
- O backend passou a expor update/delete para receitas, avaliacoes fisicas,
  bioimpedancia e diario alimentar, mantendo validacao de escopo por paciente
  nos modulos clinicos.
- O frontend possui smoke test com `node --test` para proteger a presenca das
  acoes CRUD principais no workspace e o helper HTTP de DELETE.
- O frontend agora possui testes reais de UI com Playwright/Chromium cobrindo
  fluxos de edicao/exclusao em pacientes, receitas, avaliacoes, bioimpedancia e
  diario alimentar.
- O QA visual automatizado captura screenshots desktop e mobile das rotas
  principais em `frontend/test-results/visual-qa`.
- O backend expoe contrato inicial de sessao em `/api/v1/auth/session`, com modo
  Beta sem login obrigatorio e flags de ambiente para futura autenticacao real.
- A tela de Relatorios possui estados padronizados de carregamento, API
  indisponivel, paciente local, disponibilidade de PDF e resumo vazio.
- O backend gera PDFs de cardapio e relatorio clinico em
  `/api/v1/patients/{patient_id}/reports/meal-plan.pdf` e
  `/api/v1/patients/{patient_id}/reports/clinical-summary.pdf`.
- Os PDFs backend agora possuem cabecalho SmartDiet, rodape profissional,
  paginacao, fonte em destaque para titulos e blocos visuais para secoes
  clinicas, mantendo geracao sem dependencia externa adicional.
- A navegacao nao expõe mais a tela de IA, evitando modulo sem uso pratico na
  Beta.
- A tela de ETL foi convertida em painel administrativo de dados, com fontes,
  status legal/operacional, verificacao da API brasileira e log de acoes.
- A tela de Pacientes possui graficos para metas: progresso medio, distribuicao
  por status e barras por prioridade/foco clinico.
- As metas de pacientes agora usam metricas estruturadas com valor inicial,
  valor atual, meta/faixa, unidade, tipo de metrica e direcao explicita
  (`increase`, `decrease`, `range`), eliminando inferencia textual nos graficos.
- O workspace inicial nao carrega mais os pacientes/registros ficticios antigos;
  o frontend tambem filtra esses antigos pacientes seedados do localStorage.
- Por solicitacao do usuario, o workspace inicial agora inclui o paciente real
  Gordeli com 87 kg, 160 cm de altura, avaliacao fisica inicial, bioimpedancia
  com 28% de gordura corporal e area explicita para remocao de paciente quando
  o acompanhamento for encerrado.
- O frontend recebeu uma paleta mais viva mantendo o logo, com cinza como base,
  verde principal mais intenso e laranja como acento operacional.
- A preparacao de deploy inclui Dockerfiles para backend/frontend,
  `docker-compose.yml`, arquivos `.env.example` e guia em
  `docs/deployment/DEPLOYMENT.md`.
- A revisao legal operacional das bases de alimentos esta documentada em
  `docs/etl/DATA_SOURCES_LEGAL_REVIEW.md`.

## Validacoes feitas
Backend:
```bash
.venv\Scripts\python -m pytest
```

Banco real:
```bash
.venv\Scripts\python -m alembic upgrade head
$env:PYTHONPATH='.'; .venv\Scripts\python scripts\verify_real_db.py
```
O verificador real cobre paciente, plano alimentar estruturado, avaliacao,
bioimpedancia, anamnese e diario alimentar.

Frontend:
```bash
npm.cmd run test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:ui
```

Resultado da ultima rodada:
- Backend: 27 testes passando.
- Frontend unit/smoke: 2 testes passando.
- Typecheck e build do Next.js passando.
- UI real Playwright: 24 testes passando.

Resultado da rodada de continuidade em 2026-07-08:
- Backend: 27 testes passando.
- Testes focados de PDF: 2 testes passando.
- Frontend unit/smoke: 3 testes passando.

Resultado da rodada visual/admin em 2026-07-08:
- Frontend unit/smoke: 5 testes passando.
- Frontend typecheck: passando.
- Frontend build: passando.
- UI Playwright/Chromium: 26 testes passando.

Resultado da rodada de metricas estruturadas em 2026-07-08:
- Backend: 28 testes passando.
- Migration Alembic `202607080002` aplicada no PostgreSQL local.
- Frontend unit/smoke: 5 testes passando.
- Frontend typecheck: passando.
- Frontend build: passando.
- UI Playwright/Chromium: 26 testes passando.

Rotas verificadas por HTTP no dev server local:
```bash
GET /patients -> 200
GET /recipes -> 200
GET /assessments -> 200
GET /bioimpedance -> 200
GET /diary -> 200
```

## Comandos locais
Backend:
```bash
cd backend
.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Frontend:
```bash
cd frontend
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

## Pendencias para produto 100%
- Plano alimentar ainda salva/substitui o plano inteiro; alimentos e anamnese
  usam fluxos proprios de busca/cadastro ou substituicao.
- Expandir estados padronizados para detalhes finos de cada formulario, mantendo
  o padrao aplicado em Relatorios como referencia.
- Materializar/importar a TBCA completa e a TACO no PostgreSQL quando os arquivos
  oficiais estiverem disponiveis para este ambiente educacional, mantendo
  atribuicao correta.
- Antes de distribuicao publica/comercial, obter confirmacao juridica formal
  para TACO/TBCA ou limitar o produto a importacao pelo usuario/ambiente.
- Evoluir os relatorios PDF com identidade visual completa, assinatura do
  profissional e composicao final apos revisao clinica.
- Implementar provedor real de autenticacao/autorizacao e migracoes de usuarios
  quando a Beta sair do modo sem login.

## Observacao
O PostgreSQL 17 local esta configurado com banco/usuario `smartdiet`, a
migracao inicial foi aplicada e os fluxos reais principais foram verificados
contra banco. O projeto esta em Beta funcional forte com QA visual, testes reais
de UI, revisao legal operacional das bases, contrato inicial de auth e
preparacao de deploy documentada. Antes de chamar de produto final comercial,
ainda precisa de auth real, revisao juridica formal das bases restritivas e
polimento fino dos formularios clinicos.
