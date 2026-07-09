import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

const workspaceSource = await readFile(new URL("../src/modules/workspace/functional-pages.tsx", import.meta.url), "utf8");
const apiClientSource = await readFile(new URL("../src/shared/api/client.ts", import.meta.url), "utf8");
const sidebarSource = await readFile(new URL("../src/shared/layout/sidebar.tsx", import.meta.url), "utf8");
const headerSource = await readFile(new URL("../src/shared/layout/header.tsx", import.meta.url), "utf8");
const etlSource = await readFile(new URL("../src/app/etl/page.tsx", import.meta.url), "utf8");
const dashboardDataSource = await readFile(new URL("../src/modules/dashboard/data.ts", import.meta.url), "utf8");
const smartSearchSource = await readFile(new URL("../src/shared/components/smart-search.tsx", import.meta.url), "utf8");

test("workspace exposes edit and delete actions for beta clinical modules", () => {
  for (const label of ["Editar receita", "Editar avaliacao", "Editar bioimpedancia", "Editar registro"]) {
    assert.match(workspaceSource, new RegExp(label));
  }

  for (const route of [
    "/recipes/${recipe.id}",
    "/patients/${patientId}/assessments/${item.id}",
    "/patients/${patientId}/bioimpedance/${item.id}",
    "/patients/${patientId}/diary/${item.id}",
  ]) {
    assert.match(workspaceSource, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("frontend API client supports DELETE requests", () => {
  assert.match(apiClientSource, /export async function apiDelete/);
  assert.match(apiClientSource, /method: "DELETE"/);
});

test("reports workspace exposes PDF and polished state actions", () => {
  assert.match(workspaceSource, /Baixar relatorio clinico PDF/);
  assert.match(workspaceSource, /Baixar cardapio PDF/);
  assert.match(workspaceSource, /StateBanner/);
  assert.match(workspaceSource, /EmptyState/);
  assert.match(apiClientSource, /export function apiUrl/);
});

test("navigation removes unused AI route and patients expose goal charts", () => {
  assert.doesNotMatch(sidebarSource, /\/ai|IA/);
  assert.doesNotMatch(headerSource, /\/ai|IA clinica/);
  assert.match(workspaceSource, /function PatientGoalCharts/);
  assert.match(workspaceSource, /Progresso medio/);
  assert.match(workspaceSource, /Metas por prioridade/);
  assert.match(workspaceSource, /baseline_value/);
  assert.match(workspaceSource, /direction/);
  assert.match(workspaceSource, /metric_type/);
  assert.match(workspaceSource, /Direcao do progresso/);
});

test("etl page is an admin screen with real operational actions", () => {
  assert.match(etlSource, /Administracao de dados/);
  assert.match(etlSource, /Verificar API/);
  assert.match(etlSource, /Validar checklist/);
  assert.match(etlSource, /Revisar indice local/);
  assert.match(etlSource, /\/foods\/brazilian\/search\?q=arroz/);
});

test("initial workspace ships only the requested real patient", () => {
  assert.match(workspaceSource, /name: "Gordelice"/);
  assert.match(workspaceSource, /birthDate: "1998-07-08"/);
  assert.match(workspaceSource, /gender: "Feminino"/);
  assert.match(workspaceSource, /weight: "86.4"/);
  assert.match(workspaceSource, /height: "160"/);
  assert.match(workspaceSource, /bodyFat: "37.8"/);
  assert.match(workspaceSource, /Perda de gordura com preservacao de massa magra/);
  assert.match(workspaceSource, /Aderencia ao cardapio/);
  assert.match(workspaceSource, /Frango desfiado para marmitas/);
  assert.match(workspaceSource, /Iogurte com aveia e banana/);
  assert.match(workspaceSource, /Historico de avaliacoes/);
  assert.match(workspaceSource, /Bioimpedancia completa/);
  assert.match(workspaceSource, /Diario e aderencia/);
  assert.match(workspaceSource, /Resumo alimentar \/ Plano alimentar/);
  assert.match(workspaceSource, /Orientacoes do nutricionista/);
  assert.match(workspaceSource, /Plano por refeicao/);
  assert.match(workspaceSource, /Preparos de apoio/);
  assert.match(workspaceSource, /structuredItems/);
  assert.match(workspaceSource, /Manutencao do paciente/);
  assert.match(workspaceSource, /smartdiet-gordeli-seeded/);
  assert.match(workspaceSource, /mergeRequestedInitialPatient/);
  for (const source of [workspaceSource, dashboardDataSource, smartSearchSource]) {
    assert.doesNotMatch(source, /Marina Costa|Rafael Lima|Beatriz Nunes/);
  }
});
