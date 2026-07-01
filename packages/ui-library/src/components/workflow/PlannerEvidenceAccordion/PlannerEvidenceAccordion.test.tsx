import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerEvidenceAccordion } from "./PlannerEvidenceAccordion";

describe("PlannerEvidenceAccordion", () => {
  it("renders planner evidence sections through the Radix accordion adapter", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerEvidenceAccordion, {
        ariaLabel: "Package evidence",
        defaultValue: ["recommendation-explanation"],
        items: [
          {
            badge: createElement("span", null, "Score 82"),
            children: createElement("p", null, "Ready work can be grouped in this horizon."),
            summary: "Recommended package explanation",
            title: "Why this package",
            value: "recommendation-explanation"
          },
          {
            children: createElement("p", null, "No planner decisions recorded yet."),
            summary: "0 decisions",
            title: "Decision history",
            value: "decision-history"
          }
        ],
        type: "multiple"
      })
    );

    expect(markup).toContain("planner-evidence-accordion");
    expect(markup).toContain("Why this package");
    expect(markup).toContain("Recommended package explanation");
    expect(markup).toContain("Score 82");
    expect(markup).toContain("Ready work can be grouped in this horizon.");
    expect(markup).toContain("Decision history");
  });
});
