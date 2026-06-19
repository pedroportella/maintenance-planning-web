import { expect, test } from "@playwright/test";

test("reviews recommendations and records a mock planner decision", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Planner coordination queue" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Planner sections" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Synthetic coordination queue" })).toBeVisible();
  await expect(page.getByText("WO-2101")).toBeVisible();

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
