import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerSummaryList } from "./PlannerSummaryList";

describe("PlannerSummaryList", () => {
  it("preserves label and value associations with Radix DataList markup", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerSummaryList, {
        ariaLabel: "Package summary",
        items: [
          {
            id: "score",
            label: "Score",
            tone: "info",
            value: "91"
          },
          {
            detail: "Includes blocked work orders.",
            id: "blockers",
            label: "Blockers",
            tone: "warning",
            value: "2"
          }
        ],
        variant: "compact"
      })
    );

    expect(markup).toContain("<dl");
    expect(markup).toContain("<dt");
    expect(markup).toContain("<dd");
    expect(markup).toContain('aria-label="Package summary"');
    expect(markup).toContain("planner-summary-list-compact");
    expect(markup).toContain('data-tone="warning"');
    expect(markup).toContain("Includes blocked work orders.");
  });
});
