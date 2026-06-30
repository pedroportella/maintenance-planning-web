import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerDecisionSummary } from "./PlannerDecisionSummary";

describe("PlannerDecisionSummary", () => {
  it("renders completed decision facts, note and actions", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerDecisionSummary, {
        actions: createElement(
          "span",
          null,
          createElement("a", { href: "/recommendations" }, "Back to queue"),
          createElement("a", { href: "/recommendations/pkg?changeDecision=true" }, "Change decision")
        ),
        decidedAt: "2026-01-15 08:00 UTC",
        decidedBy: "planner-workbench",
        decision: "Rejected",
        note: "Synthetic conflict remained active.",
        packageNumber: "PKG-BASE-REVIEW",
        reason: "planning-conflict",
        titleId: "latest-decision",
        tone: "critical"
      })
    );

    expect(markup).toContain('aria-labelledby="latest-decision"');
    expect(markup).toContain("Latest decision recorded");
    expect(markup).toContain("Rejected");
    expect(markup).toContain("planning-conflict");
    expect(markup).toContain("2026-01-15 08:00 UTC");
    expect(markup).toContain("planner-workbench");
    expect(markup).toContain("Synthetic conflict remained active.");
    expect(markup).toContain('href="/recommendations"');
    expect(markup).toContain("Change decision");
    expect(markup).toContain('data-tone="critical"');
  });
});
