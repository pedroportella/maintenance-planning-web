import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerStatusBadge } from "./PlannerStatusBadge";

describe("PlannerStatusBadge", () => {
  it("renders a full-radius Radix badge with the mapped status tone", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerStatusBadge, {
        children: "Ready",
        tone: "success"
      })
    );

    expect(markup).toContain("planner-status-badge");
    expect(markup).toContain('data-tone="success"');
    expect(markup).toContain('data-radius="full"');
    expect(markup).toContain('data-accent-color="green"');
    expect(markup).toContain("Ready");
  });
});
