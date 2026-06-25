import { expect, test } from "@playwright/test";
import {
  createPlannerRouteAccessibilityEvidence,
  createRouteEvidenceEntry
} from "./planner-route-accessibility/evidence-helpers";
import {
  plannerRouteFixtures,
  recommendationDecisionRoute
} from "./planner-route-accessibility/route-fixtures";
import {
  collectOverflowReport,
  collectReducedMotionReport
} from "./ui-library-accessibility/preference-layout-reports";
import { collectKeyboardFocusReport } from "./ui-library-accessibility/focus-report";
import { collectStructuralAccessibilityScan } from "./ui-library-accessibility/structural-scan";

test("records automated accessibility evidence for mock planner routes", async ({
  page
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  const evidence = createPlannerRouteAccessibilityEvidence();

  for (const fixture of plannerRouteFixtures) {
    await page.goto(fixture.path);
    const main = page.getByRole("main");

    await expect(page.getByRole("navigation", { name: "Planner sections" })).toBeVisible();
    await expect(main).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: fixture.heading })).toBeVisible();

    if (fixture.table) {
      const tableRegion = page.getByRole("region", { name: fixture.table });
      const table = page.getByRole("table", { name: fixture.table });

      await expect(tableRegion).toBeVisible();
      await expect(table).toBeVisible();
      await expect(table.getByRole("rowheader").first()).toBeVisible();
    }

    if (fixture.form) {
      await expect(page.getByRole("form", { name: fixture.form })).toBeVisible();
      await expect(page.getByRole("textbox", { name: "Decision note" })).toBeVisible();

      const rejectOption = page.getByRole("radio", { name: /Reject package/ });
      await rejectOption.focus();
      await page.keyboard.press("Space");
      await expect(rejectOption).toBeChecked();
      await expect(page.getByRole("button", { name: "Reject package" })).toBeVisible();
    }

    const scan = await collectStructuralAccessibilityScan(page);
    expect(scan.missingPageLanguage).toBe(false);
    expect(scan.unlabeledControls).toEqual([]);
    expect(scan.unlabeledImages).toEqual([]);
    expect(scan.positiveTabIndex).toEqual([]);
    expect(scan.labelInNameFailures).toEqual([]);

    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
    const keyboardFocus = await collectKeyboardFocusReport(page, 16);
    expect(keyboardFocus.missingIndicator).toEqual([]);

    evidence.automatedBrowserSmoke.routes.push(
      createRouteEvidenceEntry({
        fixture,
        keyboardFocus,
        scan,
        snapshot: await main.ariaSnapshot()
      })
    );
  }

  await testInfo.attach("planner-route-accessibility-evidence.json", {
    body: JSON.stringify(evidence, null, 2),
    contentType: "application/json"
  });
});

test("smokes planner route user-preference modes in mock mode", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ height: 900, width: 640 });
  await page.goto(recommendationDecisionRoute.path);

  const reducedMotionReport = await collectReducedMotionReport(page);
  const narrowOverflowReport = await collectOverflowReport(page);

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

  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: recommendationDecisionRoute.heading })
  ).toBeVisible();
  await expect(
    page.getByRole("form", { name: recommendationDecisionRoute.form })
  ).toBeVisible();

  const preferenceEvidence = {
    automatedBrowserSmoke: {
      forcedColorsActive: await page.evaluate(() => matchMedia("(forced-colors: active)").matches),
      narrowOverflowReport,
      reducedMotionReport,
      textSpacingReport
    },
    mode: "deterministic mock services",
    route: recommendationDecisionRoute.path
  };

  await testInfo.attach("planner-route-preference-evidence.json", {
    body: JSON.stringify(preferenceEvidence, null, 2),
    contentType: "application/json"
  });

  expect(reducedMotionReport.reduceMatches).toBe(true);
  expect(narrowOverflowReport.visibleBody).toBe(true);
  expect(narrowOverflowReport.offenders).toEqual([]);
  expect(textSpacingReport.visibleBody).toBe(true);
  expect(textSpacingReport.offenders).toEqual([]);
  expect(preferenceEvidence.automatedBrowserSmoke.forcedColorsActive).toBe(true);
});
