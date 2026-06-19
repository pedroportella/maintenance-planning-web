import { expect, test } from "@playwright/test";

test("renders the planner workbench shell and task routes", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Planner queue" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Planner sections" })).toBeVisible();
  await expect(page.getByText("Synthetic placeholders", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: /Coordination exceptions/ }).click();

  await expect(page).toHaveURL(/coordination-exceptions/);
  await expect(page.getByRole("heading", { name: "Coordination exceptions" })).toBeVisible();
  await expect(page.getByText("Placeholder task shell")).toBeVisible();
});
