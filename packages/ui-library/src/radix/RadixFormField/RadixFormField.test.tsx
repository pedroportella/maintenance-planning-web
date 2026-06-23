import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixFormField } from "./RadixFormField";

describe("RadixFormField", () => {
  it("renders label, hint, error and control description wiring", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixFormField, {
        children: (controlProps) =>
          createElement("textarea", {
            ...controlProps,
            name: "decisionNote"
          }),
        error: "Decision note is required.",
        fieldId: "decision-note",
        hint: "Use synthetic review notes only.",
        label: "Decision note",
        optionalLabel: "Required"
      })
    );

    expect(markup).toContain('for="decision-note"');
    expect(markup).toContain('aria-describedby="decision-note-hint decision-note-error"');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('role="alert"');
  });
});
