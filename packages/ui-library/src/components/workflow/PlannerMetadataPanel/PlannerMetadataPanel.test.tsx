import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerStatusBadge } from "../../feedback";
import { PlannerMetadataPanel } from "./PlannerMetadataPanel";

describe("PlannerMetadataPanel", () => {
  it("renders titled metadata panels with semantic summary-list content", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerMetadataPanel, {
        badge: createElement(PlannerStatusBadge, { children: "Ready", tone: "success" }),
        description: "Reusable package facts for planner review.",
        density: "compact",
        eyebrow: "Metadata",
        items: [
          {
            id: "run",
            label: "Run",
            value: "RUN-1000"
          },
          {
            id: "work-orders",
            label: "Work orders",
            tone: "info",
            value: "8"
          }
        ],
        summaryAriaLabel: "Package facts",
        title: "Package facts",
        titleId: "package-facts"
      })
    );

    expect(markup).toContain('aria-labelledby="package-facts"');
    expect(markup).toContain("planner-metadata-panel");
    expect(markup).toContain("<dl");
    expect(markup).toContain('aria-label="Package facts"');
    expect(markup).toContain("RUN-1000");
    expect(markup).toContain("planner-status-badge-success");
  });
});
