# QA Visual - SmartDiet

Data: 2026-07-08.

## Ferramenta
Playwright com Chromium em dois projetos:
- `desktop-chromium` com viewport 1440x1000.
- `mobile-chromium` com perfil Pixel 7.

## Rotas capturadas
- `/patients`
- `/recipes`
- `/assessments`
- `/bioimpedance`
- `/diary`
- `/meal-plans`
- `/reports`

As imagens ficam em:
`frontend/test-results/visual-qa/`

## Resultado
- Smoke visual passou em desktop e mobile.
- Fluxos reais de UI passaram para pacientes, receitas, avaliacoes,
  bioimpedancia, diario e relatorios.
- A consulta de alimentos permanece integrada ao plano alimentar e nao possui
  uma rota principal propria.

## Comando
```bash
cd frontend
npm.cmd run test:ui
```
