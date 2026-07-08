# Especificação — Banco de Alimentos

## Objetivo
Ser o mecanismo central de consulta nutricional do SmartDiet.

## Requisitos
- Busca por nome.
- Busca tolerante a erro.
- Sinônimos: aipim, macaxeira, mandioca.
- Origem da informação.
- Nutrientes por 100 g.
- Medidas caseiras.
- Categorias.
- Preparações relacionadas.
- Receitas relacionadas.
- Substituições.

## Dados mínimos por alimento
- Nome.
- Nome normalizado.
- Categoria.
- Fonte.
- Energia kcal.
- Proteína.
- Carboidratos.
- Gorduras.
- Fibras.
- Sódio.

## Experiência visual
FoodCard deve mostrar nome, categoria, kcal, macros e origem.

## Base brasileira e fallback
- A experiencia principal deve consultar alimentos brasileiros.
- A TACO local e a TBCA devem funcionar como fallback quando a API
  alimentar nao responder.
- A tela deve permitir filtrar por TACO, TBCA e cadastro proprio.
- Alimentos cadastrados manualmente devem ficar marcados como cadastro
  brasileiro revisado pelo nutricionista.
