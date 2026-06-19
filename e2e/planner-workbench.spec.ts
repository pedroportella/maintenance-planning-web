import { expect, test } from "@playwright/test";

test("renders the planner workbench shell and task routes", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Planner coordination queue" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Planner sections" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Synthetic coordination queue" })).toBeVisible();
  await expect(page.getByText("WO-2101")).toBeVisible();

  await page
    .getByRole("navigation", { name: "Planner sections" })
    .getByRole("link", { name: /Coordination exceptions/ })
    .click();

  await expect(page).toHaveURL(/coordination-exceptions/);
  await expect(page.getByRole("heading", { name: "Coordination exceptions" })).toBeVisible();
  await expect(page.getByText("Route shell", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("table", { name: "Coordination exceptions placeholder tasks" })
  ).toBeVisible();
});
