import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerAlert } from "./PlannerAlert";

describe("PlannerAlert", () => {
  it("renders warning alerts with alert semantics and Radix callout tone", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerAlert, {
        children: createElement("p", null, "Review source readiness before submitting."),
        title: "Needs review",
        tone: "warning"
      })
    );

    expect(markup).toContain("planner-alert-warning");
    expect(markup).toContain('role="alert"');
    expect(markup).toContain('data-accent-color="amber"');
    expect(markup).toContain('data-icon="exclamationTriangle"');
    expect(markup).toContain("Needs review");
  });
});
