import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerWorkflowLayout } from "./PlannerWorkflowLayout";

describe("PlannerWorkflowLayout", () => {
  it("renders workflow heading, body and actions", () => {
    const markup = renderToStaticMarkup(
      createElement(
        PlannerWorkflowLayout,
        {
          actions: createElement("button", { type: "button" }, "Save"),
          children: createElement("p", null, "Decision form"),
          contextLabel: "Decision workflow",
          lead: "Review package readiness.",
          title: "Package decision",
          titleId: "decision-title"
        }
      )
    );

    expect(markup).toContain('aria-labelledby="decision-title"');
    expect(markup).toContain("<h1");
    expect(markup).toContain("Decision form");
    expect(markup).toContain("Save");
  });
});
