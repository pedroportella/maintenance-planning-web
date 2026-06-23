import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerRadioCards } from "./PlannerRadioCards";

describe("PlannerRadioCards", () => {
  it("renders card radio options inside fieldset semantics", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerRadioCards, {
        defaultValue: "approve",
        label: "Decision",
        name: "decision",
        options: [
          {
            hint: "The package can proceed.",
            label: "Approve",
            value: "approve"
          },
          {
            label: "Reject",
            value: "reject"
          }
        ]
      })
    );

    expect(markup).toContain("<fieldset");
    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('aria-label="Approve"');
    expect(markup).toContain("The package can proceed.");
  });
});
