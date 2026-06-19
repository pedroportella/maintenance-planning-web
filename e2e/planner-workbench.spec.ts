import { expect, test } from "@playwright/test";

test("reviews recommendations and records a mock planner decision", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Planner coordination queue" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Planner sections" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Synthetic coordination queue" })).toBeVisible();
  await expect(page.getByText("WO-2101")).toBeVisible();

  await page.getByRole("link", { name: /Review coordination/ }).first().click();
  await expect(page).toHaveURL(/coordination-exceptions/);
  await expect(page.getByRole("heading", { name: "Coordination exceptions" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Coordination exception list" })).toBeVisible();
  await expect(page.getByText("Estimated effort is not present in the source event.")).toBeVisible();

  await page.getByRole("link", { name: "Open operations posture" }).click();
  await expect(page).toHaveURL(/operations-posture/);
  await expect(page.getByRole("heading", { name: "Operations posture" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Operations posture signals" })).toBeVisible();
  await expect(
    page.getByLabel("Operations posture summary").getByText("Operations evidence is available")
  ).toBeVisible();

  await page.getByRole("link", { name: "Open scenario outcomes" }).click();
  await expect(page).toHaveURL(/scenario-outcomes/);
  await expect(page.getByRole("heading", { name: "Scenario outcomes" })).toBeVisible();
  const scenarioTable = page.getByRole("table", { name: "Synthetic scenario outcomes" });
  await expect(scenarioTable).toBeVisible();
  await expect(scenarioTable.getByText("Baseline Week")).toBeVisible();
  await expect(scenarioTable.getByText("Stale data")).toBeVisible();
  await expect(scenarioTable.getByText("Degraded")).toBeVisible();

  await page
    .getByRole("navigation", { name: "Planner sections" })
    .getByRole("link", { name: /Recommendations/ })
    .click();

  await expect(page).toHaveURL(/recommendations/);
  await expect(page.getByRole("heading", { name: "Recommendations" })).toBeVisible();
  await expect(page.getByRole("article", { name: "PKG-BASE-001" })).toBeVisible();
  await expect(page.getByText("Ready work can be grouped inside the current planning horizon.")).toBeVisible();

  const readyPackage = page.getByRole("article", { name: "PKG-BASE-001" });
  await readyPackage.getByRole("textbox", { name: "Decision note" }).fill("Mock reviewer accepted the ready package.");
  await readyPackage.getByRole("button", { name: /Accept package/ }).click();

  await expect(page).toHaveURL(/decisionResult=success/);
  await expect(page.getByText("Accepted was recorded for PKG-BASE-001")).toBeVisible();
  await expect(readyPackage.getByText("planner-accepted")).toBeVisible();

  await page.getByRole("link", { name: "Open planning run" }).click();
  await expect(page).toHaveURL(/planning-runs\/50000000-0000-4000-8000-000000002000/);
  await expect(page.getByRole("heading", { name: "Planning run detail" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Planning run recommendation detail" })).toBeVisible();

  await page
    .getByRole("navigation", { name: "Planner sections" })
    .getByRole("link", { name: /Work-order backlog/ })
    .click();

  await expect(page.getByRole("heading", { name: "Work-order backlog" })).toBeVisible();
  const backlogTable = page.getByRole("table", { name: "Planner work-order backlog" });
  await expect(backlogTable).toBeVisible();
  await expect(backlogTable.getByRole("cell", { name: "Accepted for planner-accepted" }).first()).toBeVisible();
});
