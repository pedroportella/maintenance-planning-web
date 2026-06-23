import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerEmptyState } from "./PlannerEmptyState";

describe("PlannerEmptyState", () => {
  it("renders a Radix-typed empty state with optional alert semantics", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerEmptyState, {
        description: "No synthetic package matches this reviewer filter.",
        role: "alert",
        title: "No package selected",
        tone: "critical"
      })
    );

    expect(markup).toContain("planner-empty-state-critical");
    expect(markup).toContain('data-tone="critical"');
    expect(markup).toContain('role="alert"');
    expect(markup).toContain('data-icon="reader"');
    expect(markup).toContain("No package selected");
  });
});
