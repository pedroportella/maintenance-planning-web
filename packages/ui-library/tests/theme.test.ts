import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { compile } from "sass";
import { describe, expect, it } from "vitest";
import { workbenchTheme, workbenchThemeClassNames } from "../src/theme";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const packageManifest = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
) as {
  exports?: Record<string, string>;
};
const themeScssPath = fileURLToPath(new URL("../src/theme/theme.scss", import.meta.url));
const themeScss = readFileSync(themeScssPath, "utf8");
const compiledThemeCss = compile(themeScssPath, {
  loadPaths: [packageRoot],
  style: "expanded"
}).css;

describe("ui-library theme", () => {
  it("publishes the package theme entrypoints", () => {
    expect(workbenchTheme).toEqual({
      radixCssEntrypoint: "@radix-ui/themes/styles.css",
      sassEntrypoint: "@maintenance-planning/ui-library/theme.scss",
      tokenPaletteEntrypoints: [
        "@maintenance-planning/ui-tokens/scss/styles/maintenance-primitive-palette.scss",
        "@maintenance-planning/ui-tokens/scss/styles/planner-product-palette.scss"
      ]
    });
  });

  it("keeps the theme package Sass-first without a generated CSS artifact", () => {
    expect(packageManifest.exports?.["./theme.scss"]).toBe("./src/theme/theme.scss");
    expect(packageManifest.exports?.["./theme.css"]).toBeUndefined();
    expect(existsSync(new URL("../src/theme/theme.css", import.meta.url))).toBe(false);
  });

  it("imports Radix Themes CSS before token compatibility and component styles", () => {
    const radixImport = themeScss.indexOf('@import "@radix-ui/themes/styles.css";');
    const tokenImport = themeScss.indexOf('@import "@maintenance-planning/ui-tokens/theme.css";');
    const bodyStyles = themeScss.indexOf("body {");

    expect(radixImport).toBeGreaterThanOrEqual(0);
    expect(tokenImport).toBeGreaterThan(radixImport);
    expect(bodyStyles).toBeGreaterThan(tokenImport);
    expect(compiledThemeCss).toContain('@import "@radix-ui/themes/styles.css";');
    expect(compiledThemeCss).toContain("var(--mp-color-page)");
  });

  it("defines light and dark selectors from the Sass palette bridge", () => {
    expect(themeScss).toContain('[data-theme="light"]');
    expect(themeScss).toContain('[data-theme="dark"]');
    expect(compiledThemeCss).toContain("--mp-color-page: #f6f7f2");
    expect(compiledThemeCss).toContain("--mp-color-page: #0f1512");
  });

  it("includes shared classes used by exported components", () => {
    for (const className of Object.values(workbenchThemeClassNames)) {
      expect(compiledThemeCss).toContain(`.${className}`);
    }

    expect(themeScss).toContain("../components/feedback/PlannerAlert/PlannerAlert");
    expect(themeScss).toContain("../components/feedback/PlannerEmptyState/PlannerEmptyState");
    expect(themeScss).toContain("../components/feedback/PlannerLoadingState/PlannerLoadingState");
    expect(themeScss).toContain("../components/feedback/PlannerQuietNote/PlannerQuietNote");
    expect(themeScss).toContain("../components/feedback/PlannerStatusBadge/PlannerStatusBadge");
    expect(themeScss).toContain("../components/data/PlannerDataTable/PlannerDataTable");
    expect(themeScss).toContain("../components/data/PlannerFilterToolbar/PlannerFilterToolbar");
    expect(themeScss).toContain("../components/data/PlannerMetricSummary/PlannerMetricSummary");
    expect(themeScss).toContain("../components/data/PlannerPagination/PlannerPagination");
    expect(themeScss).toContain("../components/data/PlannerSegmentedNav/PlannerSegmentedNav");
    expect(themeScss).toContain("../components/data/PlannerSummaryList/PlannerSummaryList");
    expect(themeScss).toContain("../components/forms/PlannerSubmitButton/PlannerSubmitButton");
    expect(themeScss).toContain("../components/radix/RadixDataList/RadixDataList");
    expect(themeScss).toContain("../components/radix/RadixIconButton/RadixIconButton");
    expect(themeScss).toContain("../components/radix/RadixTable/RadixTable");
    expect(themeScss).toContain("../components/workflow/PlannerDecisionPanel/PlannerDecisionPanel");
    expect(themeScss).toContain("../components/workflow/PlannerMetadataPanel/PlannerMetadataPanel");
    expect(themeScss).not.toContain("../data/");
    expect(themeScss).not.toContain("../feedback/");
    expect(themeScss).not.toContain("../forms/");
    expect(themeScss).not.toContain("../layout/");
    expect(themeScss).not.toContain("../radix/");
    expect(themeScss).not.toContain("../workflow/");

    for (const tone of ["critical", "info", "neutral", "success", "warning"]) {
      expect(compiledThemeCss).toContain(`.planner-metric-card[data-tone=${tone}]`);
    }

    for (const tone of ["critical", "info", "success", "warning"]) {
      expect(compiledThemeCss).toContain(`.planner-empty-state[data-tone=${tone}]`);
    }
  });

  it("defines keyboard focus styles for shell and segmented navigation", () => {
    expect(compiledThemeCss).toContain(".planner-app-layout-menu-button:focus-visible");
    expect(compiledThemeCss).toContain(".planner-side-nav-link:focus-visible");
    expect(compiledThemeCss).toContain(".planner-segmented-nav-link:focus-visible");
  });

  it("keeps the app root on the Sass entry before app globals", () => {
    const layoutSource = readFileSync(
      new URL("../../../apps/planner-workbench/app/layout.tsx", import.meta.url),
      "utf8"
    );
    const themeImport = layoutSource.indexOf("@maintenance-planning/ui-library/theme.scss");
    const globalsImport = layoutSource.indexOf("./globals.css");

    expect(layoutSource).toContain("PlannerThemeProvider");
    expect(layoutSource).not.toContain("@radix-ui/");
    expect(themeImport).toBeGreaterThanOrEqual(0);
    expect(globalsImport).toBeGreaterThan(themeImport);
  });
});
