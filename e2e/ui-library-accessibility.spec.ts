import { expect, test } from "@playwright/test";
import { collectContrastBaseline } from "./ui-library-accessibility/contrast-baseline";
import {
  contrastTokenPairs,
  renderedContrastSamples,
  themes,
  tones
} from "./ui-library-accessibility/contrast-samples";
import {
  collectFocusReport,
  collectKeyboardFocusReport
} from "./ui-library-accessibility/focus-report";
import { collectIconAndTargetSizeReport } from "./ui-library-accessibility/icon-target-size-report";
import {
  collectOverflowReport,
  collectReducedMotionReport
} from "./ui-library-accessibility/preference-layout-reports";
import {
  hideLocalDevChrome,
  openUiLibrary
} from "./ui-library-accessibility/page-helpers";
import { collectStructuralAccessibilityScan } from "./ui-library-accessibility/structural-scan";

for (const theme of themes) {
  test(`records ${theme} contrast and focus baseline`, async ({ page }, testInfo) => {
    await openUiLibrary(page, theme);
    await hideLocalDevChrome(page);

    const baseline = await collectContrastBaseline(page, {
      renderedContrastSamples,
      tones,
      tokenPairs: contrastTokenPairs
    });
    await testInfo.attach(`ui-library-${theme}-contrast-baseline.json`, {
      body: JSON.stringify(baseline, null, 2),
      contentType: "application/json"
    });

    expect(
      baseline.tokenResults.filter((result) => !result.found),
      `${theme} contrast token samples should resolve`
    ).toEqual([]);
    expect(
      baseline.renderedResults.filter((result) => !result.found),
      `${theme} rendered contrast samples should resolve`
    ).toEqual([]);

    const focusReport = await collectFocusReport(page);
    await testInfo.attach(`ui-library-${theme}-focus-baseline.json`, {
      body: JSON.stringify(focusReport, null, 2),
      contentType: "application/json"
    });

    expect(focusReport.focusableCount).toBeGreaterThan(0);
    expect(focusReport.missingIndicator).toEqual([]);
  });
}

test("passes the structural accessibility scanner", async ({ page }, testInfo) => {
  await openUiLibrary(page, "light");
  await hideLocalDevChrome(page);

  const scan = await collectStructuralAccessibilityScan(page);
  await testInfo.attach("ui-library-structural-scan.json", {
    body: JSON.stringify(scan, null, 2),
    contentType: "application/json"
  });

  expect(scan.pageTitle).toMatch(/UI Library Evidence/);
  expect(scan.missingPageLanguage).toBe(false);
  expect(scan.unlabeledControls).toEqual([]);
  expect(scan.unlabeledImages).toEqual([]);
  expect(scan.positiveTabIndex).toEqual([]);
});

test("checks icon semantics and target-size reporting", async ({ page }, testInfo) => {
  await openUiLibrary(page, "light");
  await hideLocalDevChrome(page);

  const report = await collectIconAndTargetSizeReport(page);
  await testInfo.attach("ui-library-icons-and-target-sizes.json", {
    body: JSON.stringify(report, null, 2),
    contentType: "application/json"
  });

  expect(report.iconOnlyControls.filter((control) => !control.named)).toEqual([]);
  expect(report.pairedIconFailures).toEqual([]);
  expect(report.targetSizes).not.toHaveLength(0);
  expect(
    report.targetSizes.filter((target) => target.width < 16 || target.height < 16),
    "interactive targets should not collapse below a measurable floor"
  ).toEqual([]);
});

test("smokes reduced motion, forced colors, zoom, reflow and text spacing", async ({
  page
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openUiLibrary(page, "light");
  await hideLocalDevChrome(page);

  const reducedMotionReport = await collectReducedMotionReport(page);
  await testInfo.attach("ui-library-reduced-motion-smoke.json", {
    body: JSON.stringify(reducedMotionReport, null, 2),
    contentType: "application/json"
  });

  expect(reducedMotionReport.reduceMatches).toBe(true);
  await expect(page.getByRole("heading", { name: "UI library showcase" })).toBeVisible();

  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.reload();
  await expect(page.getByRole("heading", { name: "UI library showcase" })).toBeVisible();

  const forcedColorsReport = await collectFocusReport(page);
  await testInfo.attach("ui-library-forced-colors-smoke.json", {
    body: JSON.stringify(forcedColorsReport, null, 2),
    contentType: "application/json"
  });
  expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);
  expect(forcedColorsReport.focusableCount).toBeGreaterThan(0);
  expect(forcedColorsReport.missingIndicator).toEqual([]);

  await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
  await page.setViewportSize({ height: 900, width: 640 });
  await page.reload();
  await expect(page.getByRole("heading", { name: "UI library showcase" })).toBeVisible();

  const zoomReport = await collectOverflowReport(page);
  await testInfo.attach("ui-library-zoom-reflow-smoke.json", {
    body: JSON.stringify(zoomReport, null, 2),
    contentType: "application/json"
  });

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
  await testInfo.attach("ui-library-text-spacing-smoke.json", {
    body: JSON.stringify(textSpacingReport, null, 2),
    contentType: "application/json"
  });

  expect(zoomReport.visibleBody).toBe(true);
  expect(textSpacingReport.visibleBody).toBe(true);
});

test("keeps keyboard tab focus visibly outlined on the UI library route", async ({
  page
}, testInfo) => {
  await openUiLibrary(page, "light");
  await hideLocalDevChrome(page);

  const keyboardFocusReport = await collectKeyboardFocusReport(page, 18);
  await testInfo.attach("ui-library-keyboard-focus-report.json", {
    body: JSON.stringify(keyboardFocusReport, null, 2),
    contentType: "application/json"
  });

  expect(keyboardFocusReport.missingIndicator).toEqual([]);
});
