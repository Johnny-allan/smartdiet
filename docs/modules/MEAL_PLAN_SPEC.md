# Especificacao - Plano Alimentar

## Refeicoes obrigatorias
O plano alimentar deve suportar pelo menos:
1. Cafe da manha
2. Lanche da manha
3. Almoco
4. Lanche da tarde
5. Jantar
6. Ceia

Tambem deve permitir refeicoes extras.

## Campos por refeicao
- Nome da refeicao.
- Horario sugerido.
- Lista de alimentos ou receitas.
- Quantidade.
- Unidade.
- Gramas equivalentes.
- Calorias.
- Proteinas.
- Carboidratos.
- Gorduras.
- Fibras.
- Sodio.
- Observacoes clinicas.
- Substituicoes.

## Resumo diario
- Total kcal.
- Proteinas.
- Carboidratos.
- Gorduras.
- Fibras.
- Sodio.
- Agua recomendada.
- Distribuicao percentual dos macros.

## Substituicoes profissionais
- Substituicoes pertencem ao plano alimentar, nao a uma aba principal isolada.
- O nutricionista escolhe o alimento base da prescricao e a quantidade em gramas.
- O sistema sugere alternativas da base brasileira considerando energia,
  carboidratos, proteinas, gorduras, categoria e objetivo do paciente.
- Cada sugestao deve exibir kcal, carboidratos, proteinas, gorduras e diferencas
  frente ao alimento base.
- A alternativa so entra no plano depois da acao explicita do nutricionista.

## Experiencia visual
Usar cards por refeicao, nao uma tabela pesada. A interface deve ser clara,
objetiva e agradavel para prescricao clinica.

## Persistencia e relatorios
- Alteracoes de horarios, orientacoes e alimentos devem ser salvas automaticamente por paciente.
- O autosave deve atualizar o plano corrente, sem criar copias a cada alteracao.
- A ficha do paciente e a aba de relatorios devem consumir o mesmo plano persistido.
- Calculos nutricionais devem ser atualizados automaticamente, sem uma acao separada de "analisar plano".
- Downloads clinico e alimentar so devem ser liberados depois da pre-visualizacao do conteudo.
- O resumo clinico inclui a ficha completa; o resumo alimentar inclui dados do paciente, refeicoes, horarios e alimentos.

## Modelo de dieta mediterranea
- Tratar como padrao alimentar ajustavel, nao como prescricao rigida ou promessa terapeutica.
- Priorizar vegetais, frutas, leguminosas, graos integrais, azeite extravirgem e oleaginosas.
- Usar peixe e aves conforme o perfil; limitar carnes vermelhas, processados, acucares e graos refinados.
- Ajustar energia, porcoes, sodio, alergias, preferencias e condicoes clinicas individualmente.
- Evidencias de referencia: ensaio PREDIMED republicado no
  [New England Journal of Medicine](https://doi.org/10.1056/NEJMoa1800389) e revisao
  [Cochrane](https://www.cochrane.org/evidence/CD009825_mediterranean-style-diet-prevention-cardiovascular-disease).
