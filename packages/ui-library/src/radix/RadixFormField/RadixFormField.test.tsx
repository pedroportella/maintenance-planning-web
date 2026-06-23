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
        required: true,
        requiredLabel: "Required"
      })
    );

    expect(markup).toContain('for="decision-note"');
    expect(markup).toContain('aria-describedby="decision-note-hint decision-note-error"');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('aria-required="true"');
    expect(markup).toContain('role="alert"');
    expect(markup).toContain("Required");
  });

  it("renders group fields with fieldset and legend semantics", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixFormField, {
        children: (controlProps) =>
          createElement("div", {
            ...controlProps,
            role: "radiogroup"
          }),
        fieldId: "review-action",
        fieldType: "group",
        hint: "Choose one review action.",
        label: "Review action",
        optionalLabel: "Optional"
      })
    );

    expect(markup).toContain("<fieldset");
    expect(markup).toContain("<legend");
    expect(markup).toContain('id="review-action"');
    expect(markup).toContain('aria-describedby="review-action-hint"');
    expect(markup).toContain("Optional");
  });
});
