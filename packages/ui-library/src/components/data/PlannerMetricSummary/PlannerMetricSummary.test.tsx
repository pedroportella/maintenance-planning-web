import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerMetricSummary } from "./PlannerMetricSummary";

describe("PlannerMetricSummary", () => {
  it("renders calm metric summaries with accessible section labelling", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerMetricSummary, {
        ariaLabel: "Operations metrics",
        items: [
          {
            detail: "Ready for review",
            label: "Ready packages",
            tone: "success",
            value: "12"
          },
          {
            detail: "Needs planner attention",
            label: "Blocked packages",
            tone: "warning",
            value: "3"
          }
        ],
        variant: "compact"
      })
    );

    expect(markup).toContain('aria-label="Operations metrics"');
    expect(markup).toContain("planner-metric-summary-compact");
    expect(markup).toContain("planner-metric-card");
    expect(markup).toContain('data-tone="success"');
    expect(markup).toContain("Ready packages");
    expect(markup).toContain("Blocked packages");
  });
});
