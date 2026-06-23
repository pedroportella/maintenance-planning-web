import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerRadioGroup } from "./PlannerRadioGroup";

describe("PlannerRadioGroup", () => {
  it("renders group labels, radio roles and shared descriptions", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerRadioGroup, {
        hint: "Choose one action.",
        label: "Review action",
        name: "reviewAction",
        options: [
          {
            label: "Approve",
            value: "approve"
          },
          {
            label: "Defer",
            value: "defer"
          }
        ],
        required: true
      })
    );

    expect(markup).toContain("<fieldset");
    expect(markup).toContain("<legend");
    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('aria-required="true"');
    expect(markup).toContain("Choose one action.");
  });
});
