import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerResponsiveGrid } from "./PlannerResponsiveGrid";

describe("PlannerResponsiveGrid", () => {
  it("publishes route-safe responsive grid attributes", () => {
    const markup = renderToStaticMarkup(
      createElement(
        PlannerResponsiveGrid,
        {
          ariaLabel: "Posture details",
          as: "section",
          balance: "primary",
          children: [
            createElement("div", { key: "signals" }, "Signals"),
            createElement("div", { key: "import" }, "Import")
          ],
          collapseAt: "wide",
          columns: "two"
        }
      )
    );

    expect(markup).toContain('aria-label="Posture details"');
    expect(markup).toContain('data-balance="primary"');
    expect(markup).toContain('data-collapse-at="wide"');
    expect(markup).toContain('data-columns="two"');
    expect(markup).toContain("planner-responsive-grid");
  });
});
