import { describe, expect, it } from "vitest";
import { plannerThemeConfig } from "./theme-config";

describe("plannerThemeConfig", () => {
  it("publishes a typed Radix Theme placeholder without importing Radix", () => {
    expect(plannerThemeConfig).toEqual({
      accentColor: "blue",
      defaultAppearance: "system",
      grayColor: "gray",
      panelBackground: "solid",
      radius: "medium",
      scaling: "100%"
    });
  });
});
