import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

const routes = [
  "/patients",
  "/recipes",
  "/assessments",
  "/bioimpedance",
  "/diary",
  "/meal-plans",
  "/reports",
  "/etl",
];

test.beforeEach(async ({ page }) => {
  await page.route("http://127.0.0.1:8000/**", (route) => route.abort());
  await page.addInitScript(() => window.localStorage.clear());
});

for (const route of routes) {
  test(`visual smoke ${route}`, async ({ page }, testInfo) => {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();

    const projectName = testInfo.project.name.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const fileName = `${route.replace("/", "") || "home"}-${projectName}.png`;
    const outputDir = path.join(process.cwd(), "test-results", "visual-qa");
    await mkdir(outputDir, { recursive: true });
    await page.screenshot({ path: path.join(outputDir, fileName), fullPage: true });
  });
}
