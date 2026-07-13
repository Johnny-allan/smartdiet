import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("http://127.0.0.1:8000/**", (route) => route.abort());
  await page.addInitScript(() => window.localStorage.clear());
});

test("patients workspace supports edit mode", async ({ page }) => {
  await page.goto("/patients");

  await expect(page.getByRole("heading", { name: "Pacientes", level: 2 })).toBeVisible();
  await page.getByLabel("Nome completo").fill("Paciente QA");
  await page.getByLabel("Objetivo").fill("Acompanhamento inicial");
  await page.getByRole("button", { name: "Cadastrar paciente" }).click();

  await expect(page.getByRole("button", { name: /Paciente QA/ })).toBeVisible();
  await page.getByRole("button", { name: /Paciente QA/ }).click();
  await page.getByRole("button", { name: "Editar" }).first().click();

  await expect(page.getByRole("heading", { name: "Editar paciente" })).toBeVisible();
  await page.getByLabel("Objetivo").fill("QA visual e evolucao clinica");
  await page.getByRole("button", { name: "Salvar alteracoes" }).click();

  await expect(page.getByText("Paciente local atualizado")).toBeVisible();
  await expect(page.locator("span").filter({ hasText: /^QA visual e evolucao clinica$/ }).last()).toBeVisible();
});

test("recipes workspace supports create edit and remove", async ({ page }) => {
  await page.goto("/recipes");
  await expect(page.getByLabel("Paciente")).toBeVisible();

  await page.getByLabel("Titulo").fill("Receita QA");
  await page.getByLabel("Ingredientes").fill("Iogurte natural, banana e aveia");
  await page.getByLabel("Kcal").fill("320");
  await page.getByLabel("Proteinas (g)").fill("18");
  await page.getByRole("button", { name: "Salvar receita" }).click();

  await expect(page.getByRole("heading", { name: "Receita QA" })).toBeVisible();
  await page.locator("article", { hasText: "Receita QA" }).getByRole("button", { name: "Editar" }).click();
  await expect(page.getByRole("heading", { name: "Editar receita" })).toBeVisible();
  await page.getByLabel("Titulo").fill("Receita QA ajustada");
  await page.getByRole("button", { name: "Salvar alteracoes" }).click();

  await expect(page.getByRole("heading", { name: "Receita QA ajustada" })).toBeVisible();
  await page.locator("article", { hasText: "Receita QA ajustada" }).getByRole("button", { name: "Remover" }).click();
  await expect(page.getByRole("heading", { name: "Receita QA ajustada" })).toHaveCount(0);
});

test("assessment diary and bioimpedance pages expose CRUD actions", async ({ page }) => {
  await page.goto("/assessments");
  await expect(page.getByLabel("Paciente")).toBeVisible();
  await page.getByLabel("Peso kg").fill("70");
  await page.getByLabel("Altura cm").fill("170");
  await page.getByRole("button", { name: "Salvar avaliacao" }).click();
  await expect(page.getByText(/IMC 24/)).toBeVisible();
  await expect(page.locator("article").first().getByRole("button", { name: "Editar" })).toBeVisible();

  await page.goto("/bioimpedance");
  await page.getByLabel("Gordura %").fill("25");
  await page.getByLabel("Agua corporal L").fill("40");
  await page.getByRole("button", { name: "Salvar bioimpedancia" }).click();
  await expect(page.getByText(/gordura 25%/)).toBeVisible();
  await expect(page.locator("article").first().getByRole("button", { name: "Remover" })).toBeVisible();

  await page.goto("/diary");
  await page.getByLabel("Registro").fill("Almoco com arroz, feijao e frango");
  await page.getByRole("button", { name: "Registrar diario" }).click();
  await expect(page.getByText("Almoco com arroz, feijao e frango")).toBeVisible();
  await expect(page.locator("article").first().getByRole("button", { name: "Editar" })).toBeVisible();
});

test("reports workspace previews data before download and printing", async ({ page }) => {
  await page.goto("/reports");

  await expect(page.getByRole("heading", { name: "Relatorios", level: 2 })).toBeVisible();
  const download = page.getByRole("button", { name: "Baixar resumo conferido" });
  const print = page.getByRole("button", { name: "Imprimir / salvar em PDF" });
  await expect(download).toBeDisabled();
  await expect(print).toBeDisabled();
  await page.getByRole("button", { name: "Visualizar e conferir" }).click();
  await expect(page.getByTitle(/Pre-visualizacao do resumo clinico/)).toBeVisible();
  await expect(download).toBeEnabled();
  await expect(print).toBeEnabled();
  await expect(page.getByText("Paciente local da Beta")).toBeVisible();
  await expect(page.getByText("Paciente selecionado")).toBeVisible();
});
