import { expect, test } from "@playwright/test";

test("reviews recommendations and records a mock planner decision", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Planner Workbench" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Planner sections" })).toBeVisible();
  await expect(page.getByText("Local review boundary")).toBeVisible();

  await page.getByRole("link", { name: /Review recommendations/ }).first().click();
  await expect(page).toHaveURL(/recommendations/);
  await expect(page.getByRole("heading", { name: "Recommendations" })).toBeVisible();
  const packageQueue = page.getByRole("table", { name: "Package recommendation queue" });
  await expect(packageQueue).toBeVisible();
  await expect(packageQueue.getByText("PKG-BASE-001").first()).toBeVisible();
  await expect(packageQueue.getByText("Baseline weekly work package")).toBeVisible();

  await page
    .getByRole("navigation", { name: "Planner sections" })
    .getByRole("link", { name: /Operations posture/ })
    .click();
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

  await page.getByRole("link", { name: /Open recommendations/ }).click();
  await expect(page).toHaveURL(/recommendations/);

  await packageQueue.getByRole("link", { name: /Open package PKG-BASE-001/ }).click();
  await expect(page).toHaveURL(/recommendations\/60000000-0000-4000-8000-000000002000/);
  await expect(page.getByRole("heading", { level: 1, name: "PKG-BASE-001" })).toBeVisible();
  await expect(page.getByRole("table", { name: "PKG-BASE-001 work orders" })).toBeVisible();
  await expect(page.getByText("Ready work can be grouped inside the current planning horizon.")).toBeVisible();

  await page.getByRole("textbox", { name: "Decision note" }).fill("Mock reviewer accepted the ready package.");
  await page.getByRole("button", { name: /Accept package/ }).click();

  await expect(page).toHaveURL(/decisionResult=success/);
  await expect(page.getByText("Accepted was recorded for PKG-BASE-001")).toBeVisible();
  await expect(page.getByText("planner-accepted")).toBeVisible();

  await page.getByRole("link", { name: "Open planning run" }).click();
  await expect(page).toHaveURL(/planning-runs\/50000000-0000-4000-8000-000000002000/);
  await expect(page.getByRole("heading", { name: "Planning run detail" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Planning run recommendation detail" })).toBeVisible();

  await page
    .getByRole("navigation", { name: "Planner sections" })
    .getByRole("link", { name: /Work-order backlog/ })
    .click();

  await expect(page.getByRole("heading", { name: "Work-order backlog" })).toBeVisible();
  const backlogTable = page.getByRole("table", { name: "Planner work-order triage" });
  await expect(backlogTable).toBeVisible();
  await expect(backlogTable.getByRole("cell", { name: "Accepted for planner-accepted" }).first()).toBeVisible();

  await page
    .getByRole("navigation", { name: "Planner sections" })
    .getByRole("link", { name: /Coordination exceptions/ })
    .click();
  await expect(page).toHaveURL(/coordination-exceptions/);
  await expect(page.getByRole("heading", { name: "Coordination exceptions" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Planner work-order triage" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Exceptions/ })).toHaveAttribute("aria-current", "page");
});

test("resolves visible package numbers to stable package detail routes", async ({ page }) => {
  await page.goto("/recommendations/package/PKG-BASE-001");

  await expect(page).toHaveURL(/recommendations\/60000000-0000-4000-8000-000000002000/);
  await expect(page.getByRole("heading", { level: 1, name: "PKG-BASE-001" })).toBeVisible();
});

test("renders a controlled state for an unknown package recommendation", async ({ page }) => {
  await page.goto("/recommendations/not-a-package");

  await expect(page.getByRole("heading", { name: "Package recommendation not found" })).toBeVisible();
  await expect(page.getByText("No package recommendation matched not-a-package")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to recommendations" })).toBeVisible();
});
