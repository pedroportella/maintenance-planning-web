import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { compile } from "sass";
import { describe, expect, it } from "vitest";
import { workbenchTheme, workbenchThemeClassNames } from "../src/theme";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
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

    expect(themeScss).toContain("../feedback/PlannerAlert/PlannerAlert");
    expect(themeScss).toContain("../feedback/PlannerEmptyState/PlannerEmptyState");
    expect(themeScss).toContain("../feedback/PlannerLoadingState/PlannerLoadingState");
    expect(themeScss).toContain("../feedback/PlannerQuietNote/PlannerQuietNote");
    expect(themeScss).toContain("../feedback/PlannerStatusBadge/PlannerStatusBadge");
    expect(themeScss).toContain("../data/PlannerDataTable/PlannerDataTable");
    expect(themeScss).toContain("../data/PlannerMetricSummary/PlannerMetricSummary");
    expect(themeScss).toContain("../data/PlannerSummaryList/PlannerSummaryList");
    expect(themeScss).toContain("../radix/RadixDataList/RadixDataList");
    expect(themeScss).toContain("../radix/RadixTable/RadixTable");
    expect(themeScss).toContain("../workflow/PlannerDecisionPanel/PlannerDecisionPanel");
    expect(themeScss).toContain("../workflow/PlannerMetadataPanel/PlannerMetadataPanel");

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
    expect(compiledThemeCss).toContain(".segmented-nav-link:focus-visible");
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
