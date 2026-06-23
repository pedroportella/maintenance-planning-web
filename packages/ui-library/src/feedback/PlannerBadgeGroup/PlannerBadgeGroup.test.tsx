import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerBadgeGroup } from "./PlannerBadgeGroup";
import { PlannerStatusBadge } from "../PlannerStatusBadge";

describe("PlannerBadgeGroup", () => {
  it("groups status badges behind a reusable layout class", () => {
    const markup = renderToStaticMarkup(
      createElement(
        PlannerBadgeGroup,
        {
          align: "end",
          ariaLabel: "Review status",
          children: [
            createElement(PlannerStatusBadge, {
              children: "Ready",
              key: "ready",
              tone: "success"
            }),
            createElement(PlannerStatusBadge, {
              children: "Mock mode",
              key: "mode",
              tone: "neutral"
            })
          ]
        }
      )
    );

    expect(markup).toContain('aria-label="Review status"');
    expect(markup).toContain('data-align="end"');
    expect(markup).toContain("planner-badge-group");
    expect(markup).toContain("planner-status-badge-success");
  });
});
