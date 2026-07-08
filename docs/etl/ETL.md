# ETL — SmartDiet

## Objetivo
Importar e atualizar bases públicas de alimentos de forma legal, rastreável e versionada.

## Fontes planejadas
- TBCA: alimentos brasileiros e preparações, respeitando termos de uso.
- TACO: complemento nacional, conforme licença.
- Open Food Facts: produtos industrializados, licença ODbL.
- USDA FoodData Central: base ampla e API oficial.

## Regras legais
- Não redistribuir bases restritivas sem autorização.
- Preservar atribuição e origem.
- Guardar versão da fonte.
- Registrar data de importação.
- Permitir atualização quando a fonte mudar.

## Pipeline
1. Verificar nova versão da fonte.
2. Baixar dados legalmente.
3. Validar formato.
4. Normalizar nomes e nutrientes.
5. Mapear unidades.
6. Inserir em tabelas staging.
7. Fazer merge no banco oficial.
8. Registrar changelog.
9. Reindexar busca.

## Tabelas staging sugeridas
- etl.import_jobs
- etl.import_logs
- etl.source_versions
- etl.raw_foods
- etl.raw_nutrients
- etl.mapping_errors

## Nutrientes
Usar tabela relacional `nutrition.nutrients` + `nutrition.food_nutrients`, evitando colunas fixas para cada nutriente.

## Decisao atual de produto
- A prescricao alimentar deve priorizar base brasileira.
- A TACO 4a edicao foi materializada como fallback local para quando a API de
  busca alimentar nao responder.
- A TBCA foi obtida das paginas publicas oficiais e integrada como segunda
  tabela brasileira local, mantendo o formato por 100 g.
- Foram indexados 5.875 alimentos TBCA. O primeiro lote possui nutrientes por
  100 g detalhados para 500 alimentos; os demais ficam pesquisaveis e podem ter
  os nutrientes completados por lotes com o importador.
- APIs externas ficam como complemento futuro para produtos industrializados
  brasileiros, sem substituir a base nacional principal.

## Fallback local implementado
- Arquivo fonte usado na implementacao: `Taco-4a-Edicao.xlsx`.
- Catalogo gerado no frontend em `src/modules/foods/taco-foods.ts`.
- Catalogo gerado no backend em `app/foods/taco_data.py`.
- Dados TBCA no frontend em `src/modules/foods/tbca-foods.ts`.
- Dados TBCA no backend em `app/foods/tbca_data.py`.
- Registro bruto gerado em `backend/data/tbca_public_foods.json`.
- Importador: `backend/scripts/fetch_tbca_public.py`.
- Mesclador de indice completo: `backend/scripts/merge_tbca_index.py`.
- Gerador frontend: `backend/scripts/generate_tbca_frontend.py`.
- Endpoint: `GET /api/v1/foods/brazilian/search?q=banana`.
- O endpoint consulta TACO, TBCA e proximas tabelas nacionais
  importadas.
- Valores exibidos por 100 g: kcal, proteina, carboidratos, gorduras, fibras
  e sodio.

## Revisao legal operacional
Ver `docs/etl/DATA_SOURCES_LEGAL_REVIEW.md` para a politica atual de uso,
atribuicao e redistribuicao das bases TACO, TBCA, Open Food Facts e USDA.
