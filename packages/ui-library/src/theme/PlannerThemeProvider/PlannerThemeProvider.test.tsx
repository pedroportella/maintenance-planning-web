import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { plannerThemeConfig } from "../theme-config";
import { PlannerThemeProvider } from "./PlannerThemeProvider";

describe("PlannerThemeProvider", () => {
  it("wraps children with next-themes and Radix Theme configuration", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerThemeProvider, {
        children: createElement("main", { id: "planner-content" }, "Planner content")
      })
    );

    expect(markup).toContain("planner-content");
    expect(markup).toContain("radix-themes");
    expect(markup).toContain(plannerThemeConfig.themeClassName);
    expect(markup).toContain('data-accent-color="teal"');
    expect(markup).toContain('data-gray-color="sage"');
    expect(markup).toContain('data-radius="medium"');
  });

  it("allows route roots to force a concrete light or dark appearance", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerThemeProvider, {
        children: createElement("main", null, "Forced appearance"),
        forcedAppearance: "dark",
        storageKey: "planner-test-theme"
      })
    );

    expect(markup).toContain("Forced appearance");
    expect(markup).toContain("planner-test-theme");
  });
});
