import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerCheckbox } from "./PlannerCheckbox";

describe("PlannerCheckbox", () => {
  it("renders checkbox labels and disabled state", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerCheckbox, {
        disabled: true,
        hint: "Required before this action can be submitted.",
        label: "I reviewed the recommendation",
        name: "reviewed",
        required: true
      })
    );

    expect(markup).toContain('for="reviewed"');
    expect(markup).toContain('role="checkbox"');
    expect(markup).toContain("Required before this action can be submitted.");
    expect(markup).toContain("disabled");
  });
});
