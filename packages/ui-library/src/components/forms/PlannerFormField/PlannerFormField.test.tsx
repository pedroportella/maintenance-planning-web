import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerFormField } from "./PlannerFormField";

describe("PlannerFormField", () => {
  it("provides IDs and descriptions to the child control", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerFormField, {
        children: (controlProps) =>
          createElement("input", {
            ...controlProps,
            name: "packageNumber"
          }),
        error: "Package number is required.",
        hint: "Use a synthetic package number.",
        id: "package-number",
        label: "Package number",
        required: true
      })
    );

    expect(markup).toContain('for="package-number"');
    expect(markup).toContain('aria-describedby="package-number-hint package-number-error"');
    expect(markup).toContain('aria-required="true"');
    expect(markup).toContain("Required");
  });
});
