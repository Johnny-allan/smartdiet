# Revisao Legal de Bases Alimentares

Data da revisao: 2026-07-08.

Esta revisao nao substitui parecer juridico. Ela define uma politica tecnica
conservadora para reduzir risco antes de qualquer distribuicao publica.

## TBCA
Fonte oficial consultada: https://fcf.usp.br/tbca/

Status: uso publico para consulta, mas nao foi localizado nesta revisao um texto
de licenca permissiva claro autorizando redistribuicao integral da base em
produto comercial.

Politica SmartDiet:
- Nao distribuir dump integral TBCA em releases publicos sem autorizacao ou
  termo expresso.
- Manter atribuicao visivel: TBCA/FCF-USP/FoRC, conforme fonte.
- Preferir importador/ETL que o usuario execute a partir da fonte oficial.
- Em ambiente comercial, substituir dados embarcados por cache gerado pelo
  usuario/cliente ou por contrato/autorizacao formal.

## TACO
Fonte historica oficial indicada: http://www.nepa.unicamp.br/taco/home.php?ativo=home

Status: a TACO 4a edicao e amplamente referenciada como NEPA/UNICAMP, mas esta
revisao nao encontrou licenca aberta inequivoca para redistribuicao comercial
da base completa.

Politica SmartDiet:
- Nao tratar TACO como dado livre para redistribuicao comercial ate confirmacao.
- Manter atribuicao NEPA/UNICAMP e edicao/versao da tabela.
- Preservar fallback apenas para Beta/local e documentar sua origem.
- Antes de publicar SaaS, obter parecer/autorizacao ou remover dados embarcados.

## Open Food Facts
Fonte oficial consultada: https://world.openfoodfacts.org/data

Status: base aberta, mas com obrigacoes de atribuicao e compartilhamento pela
licenca ODbL para banco de dados; imagens possuem licencas proprias.

Politica SmartDiet:
- Usar como fonte complementar para industrializados.
- Registrar origem por item e data de coleta.
- Cumprir atribuicao e avaliar obrigacoes ODbL se houver base derivada publica.
- Evitar redistribuir imagens sem tratar licenca/atribuicao separadamente.

## USDA FoodData Central
Fonte oficial consultada: https://fdc.nal.usda.gov/api-guide/

Status: a propria documentacao da USDA informa que os dados FoodData Central
estao em dominio publico/CC0 e pede citacao da fonte quando possivel.

Politica SmartDiet:
- Pode ser usado como fonte complementar.
- Registrar `FoodData Central` como origem e armazenar FDC ID.
- Respeitar limites de API e manter chave fora do frontend/repositorio.

## Decisao para release
- Beta local: manter TACO/TBCA como fallback com atribuicao e aviso.
- Preview fechado: permitido somente com ciencia do risco e sem redistribuicao
  publica dos arquivos de dados.
- Produto comercial publico: remover dumps TACO/TBCA embarcados ou obter
  autorizacao/licenca formal antes do deploy.
