import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixAccordion } from "./RadixAccordion";

describe("RadixAccordion", () => {
  it("renders multiple accordion triggers, summaries, badges and content", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixAccordion, {
        ariaLabel: "Recommendation evidence",
        defaultValue: ["source-readiness"],
        items: [
          {
            badge: createElement("span", null, "Blocked"),
            content: createElement("p", null, "Two work orders need review."),
            summary: "2 ready, 1 blocked",
            trigger: "Source-data readiness",
            value: "source-readiness"
          },
          {
            content: createElement("p", null, "No previous decisions."),
            trigger: "Decision history",
            value: "decision-history"
          }
        ],
        type: "multiple"
      })
    );

    expect(markup).toContain('aria-label="Recommendation evidence"');
    expect(markup).toContain("Source-data readiness");
    expect(markup).toContain("2 ready, 1 blocked");
    expect(markup).toContain("Blocked");
    expect(markup).toContain("Two work orders need review.");
    expect(markup).toContain("Decision history");
    expect(markup).toContain('data-state="open"');
  });
});
