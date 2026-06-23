import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerTextArea } from "./PlannerTextArea";

describe("PlannerTextArea", () => {
  it("renders an errored textarea with alert semantics", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerTextArea, {
        error: "Decision notes are required.",
        label: "Decision notes",
        name: "decisionNotes",
        required: true
      })
    );

    expect(markup).toContain('for="decisionNotes"');
    expect(markup).toContain("<textarea");
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('role="alert"');
  });
});
