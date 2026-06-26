import { expect, test } from "@playwright/test";
import { collectOverflowReport } from "./ui-library-accessibility/preference-layout-reports";

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
  await expect(page.locator(".planner-decision-notice-focus")).toBeFocused();
  await expect(page.getByText("Accepted was recorded for PKG-BASE-001")).toBeVisible();
  await expect(page.getByText("planner-accepted", { exact: true }).first()).toBeVisible();

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

test("opens packages from the first visible mobile recommendation column", async ({
  page
}, testInfo) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/recommendations");

  const packageQueue = page.getByRole("table", { name: "Package recommendation queue" });
  await expect(packageQueue).toBeVisible();

  const packageLink = packageQueue
    .getByRole("rowheader", { name: /PKG-BASE-001/ })
    .getByRole("link", { name: "Open package PKG-BASE-001" });
  await expect(packageLink).toBeVisible();

  const linkBounds = await packageLink.boundingBox();
  if (!linkBounds) {
    throw new Error("Expected the mobile package link to have visible bounds.");
  }

  expect(linkBounds.x).toBeGreaterThanOrEqual(0);
  expect(linkBounds.x).toBeLessThan(390);

  const mobileOverflowReport = await collectOverflowReport(page);
  await testInfo.attach("recommendations-route-mobile-overflow.json", {
    body: JSON.stringify(mobileOverflowReport, null, 2),
    contentType: "application/json"
  });
  expect(mobileOverflowReport.visibleBody).toBe(true);
  expect(mobileOverflowReport.offenders).toEqual([]);

  await packageLink.click();
  await expect(page).toHaveURL(/recommendations\/60000000-0000-4000-8000-000000002000/);
  await expect(page.getByRole("heading", { level: 1, name: "PKG-BASE-001" })).toBeVisible();
});

test("supports keyboard and low-vision access through the work-order triage route", async ({
  page
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ height: 900, width: 640 });
  await page.goto("/work-order-backlog");

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await skipLink.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#planner-main")).toBeFocused();

  await expect(page.getByRole("heading", { name: "Work-order backlog" })).toBeVisible();

  const tableRegion = page.getByRole("region", { name: "Planner work-order triage" });
  const backlogTable = page.getByRole("table", { name: "Planner work-order triage" });
  await expect(tableRegion).toBeVisible();
  await tableRegion.focus();
  await expect(tableRegion).toBeFocused();
  await expect(backlogTable.getByRole("rowheader", { name: /WO-2000/ })).toBeVisible();

  const dueSort = backlogTable.getByRole("button", {
    name: /Due.*Sorted ascending.*Activate to sort descending/i
  });
  await dueSort.click();
  await expect(backlogTable.locator("th").filter({ hasText: "Due" })).toHaveAttribute(
    "aria-sort",
    "descending"
  );
  await expect(
    backlogTable.getByRole("button", {
      name: /Due.*Sorted descending.*Activate to sort ascending/i
    })
  ).toBeVisible();

  await page.getByRole("textbox", { name: "Search work orders" }).fill("WO-2000");
  await expect(page.getByRole("status").filter({ hasText: /1 shown from 2 all rows after 1 search match/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next page unavailable" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Previous page unavailable" })).toBeDisabled();

  await page.getByRole("textbox", { name: "Search work orders" }).fill("zzzz");
  await expect(page.getByRole("status").filter({ hasText: /0 shown from 2 all rows after 0 search matches/i })).toBeVisible();
  await expect(page.getByText('No work orders match "zzzz" within the all filter.')).toBeVisible();

  const mobileOverflowReport = await collectOverflowReport(page);
  await testInfo.attach("work-order-route-mobile-overflow.json", {
    body: JSON.stringify(mobileOverflowReport, null, 2),
    contentType: "application/json"
  });
  expect(mobileOverflowReport.visibleBody).toBe(true);
  expect(mobileOverflowReport.offenders).toEqual([]);

  await page.addStyleTag({
    content: `
      * {
        letter-spacing: 0.12em !important;
        line-height: 1.5 !important;
        word-spacing: 0.16em !important;
      }

      p {
        margin-bottom: 2em !important;
      }
    `
  });

  const textSpacingReport = await collectOverflowReport(page);
  await testInfo.attach("work-order-route-text-spacing-overflow.json", {
    body: JSON.stringify(textSpacingReport, null, 2),
    contentType: "application/json"
  });
  expect(textSpacingReport.offenders).toEqual([]);

  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Work-order backlog" })).toBeVisible();
  expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);
});

test("resolves visible package numbers to stable package detail routes", async ({ page }) => {
  await page.goto("/recommendations/package/PKG-BASE-001");

  await expect(page).toHaveURL(/recommendations\/60000000-0000-4000-8000-000000002000/);
  await expect(page.getByRole("heading", { level: 1, name: "PKG-BASE-001" })).toBeVisible();
});

test("keeps repeated mock decision history free of duplicate React keys", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/recommendations/60000000-0000-4000-8000-000000002000");
  await expect(page.getByRole("heading", { level: 1, name: "PKG-BASE-001" })).toBeVisible();

  for (const note of ["Repeated mock decision one", "Repeated mock decision two"]) {
    await page.getByRole("textbox", { name: "Decision note" }).fill(note);
    await page.getByRole("button", { name: "Accept package" }).click();
    await expect(page.locator(".planner-decision-notice-focus")).toBeFocused();
  }

  expect(
    consoleErrors.filter((message) =>
      message.includes("Encountered two children with the same key")
    )
  ).toEqual([]);
});

test("renders a controlled state for an unknown package recommendation", async ({ page }) => {
  await page.goto("/recommendations/not-a-package");

  await expect(page.getByRole("heading", { name: "Package recommendation not found" })).toBeVisible();
  await expect(page.getByText("No package recommendation matched not-a-package")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to recommendations" })).toBeVisible();
});
