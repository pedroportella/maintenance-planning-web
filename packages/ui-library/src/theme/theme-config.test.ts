import { describe, expect, it } from "vitest";
import {
  plannerNextThemesConfig,
  plannerRadixThemeConfig,
  plannerThemeConfig,
  type PlannerNextThemesConfig,
  type PlannerRadixThemeConfig
} from "./theme-config";

describe("plannerThemeConfig", () => {
  it("publishes typed Radix Theme props for the planner provider", () => {
    const radixThemeConfig = plannerRadixThemeConfig satisfies PlannerRadixThemeConfig;

    expect(radixThemeConfig).toEqual({
      accentColor: "teal",
      appearance: "inherit",
      grayColor: "sage",
      hasBackground: true,
      panelBackground: "solid",
      radius: "medium",
      scaling: "100%"
    });
  });

  it("publishes next-themes settings for light, dark and system mode", () => {
    const nextThemesConfig = plannerNextThemesConfig satisfies PlannerNextThemesConfig;

    expect(nextThemesConfig).toEqual({
      attribute: "class",
      defaultTheme: "system",
      disableTransitionOnChange: true,
      enableColorScheme: true,
      enableSystem: true,
      storageKey: "planner-workbench-theme",
      themes: ["light", "dark"]
    });
  });

  it("keeps the combined provider config stable", () => {
    expect(plannerThemeConfig).toEqual({
      nextThemes: plannerNextThemesConfig,
      radixTheme: plannerRadixThemeConfig,
      themeClassName: "planner-theme"
    });
  });
});
