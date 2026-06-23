import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { workbenchTheme, workbenchThemeClassNames } from "../src/theme";

const themeCss = readFileSync(new URL("../src/theme/theme.css", import.meta.url), "utf8");

describe("ui-library theme", () => {
  it("publishes the package theme entrypoints", () => {
    expect(workbenchTheme).toEqual({
      cssEntrypoint: "@maintenance-planning/ui-library/theme.css",
      sassEntrypoint: "@maintenance-planning/ui-library/theme.scss",
      tokenEntrypoint: "@maintenance-planning/ui-tokens/theme.css"
    });
  });

  it("imports token custom properties before component styles", () => {
    expect(themeCss.trimStart().startsWith('@import "@maintenance-planning/ui-tokens/theme.css";')).toBe(
      true
    );
    expect(themeCss).toContain("body {");
    expect(themeCss).toContain("var(--mp-color-page)");
  });

  it("includes shared classes used by exported components", () => {
    for (const className of Object.values(workbenchThemeClassNames)) {
      expect(themeCss).toContain(`.${className}`);
    }

    for (const tone of ["critical", "info", "neutral", "success", "warning"]) {
      expect(themeCss).toContain(`.status-badge-${tone}`);
      expect(themeCss).toContain(`.workbench-alert-${tone}`);
      expect(themeCss).toContain(`.metric-card[data-tone="${tone}"]`);
    }
  });

  it("defines keyboard focus styles for shell and segmented navigation", () => {
    expect(themeCss).toContain(".app-shell-nav-link:focus-visible");
    expect(themeCss).toContain(".segmented-nav-link:focus-visible");
  });
});
