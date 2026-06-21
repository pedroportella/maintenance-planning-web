import { expect, test } from "@playwright/test";

test("renders local API recommendations and operations posture", async ({ page }) => {
  await page.goto("/recommendations");

  await expect(page.getByRole("heading", { exact: true, name: "Recommendations" })).toBeVisible();
  await expect(page.getByText("backend mode").first()).toBeVisible();
  const packageQueue = page.getByRole("table", { name: "Package recommendation queue" });
  await expect(packageQueue).toBeVisible();
  await packageQueue.getByRole("link", { name: /Open package/ }).first().click();

  await expect(page).toHaveURL(/recommendations\/[^/]+/);
  await expect(page.getByText("backend mode").first()).toBeVisible();
  await expect(page.getByRole("table", { name: /work orders/ })).toBeVisible();
  await expect(page.getByText("WO-2000").first()).toBeVisible();
  await expect(page.getByText("Replace pump seals").first()).toBeVisible();

  await page
    .getByRole("navigation", { name: "Planner sections" })
    .getByRole("link", { name: /Operations posture/ })
    .click();

  await expect(page).toHaveURL(/operations-posture/);
  await expect(page.getByRole("heading", { name: "Operations posture" })).toBeVisible();
  await expect(page.getByText("backend mode").first()).toBeVisible();
  await expect(page.getByRole("table", { name: "Operations posture signals" })).toBeVisible();
  await expect(page.getByText("synthetic-source").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current backend review state" })).toBeVisible();
});
