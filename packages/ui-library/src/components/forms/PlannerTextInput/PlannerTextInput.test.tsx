import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerTextInput } from "./PlannerTextInput";

describe("PlannerTextInput", () => {
  it("renders a required text input with a label and hint", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerTextInput, {
        hint: "Search by package or work order.",
        label: "Search",
        name: "search",
        placeholder: "Search review items",
        required: true
      })
    );

    expect(markup).toContain('for="search"');
    expect(markup).toContain('name="search"');
    expect(markup).toContain("Search by package or work order.");
    expect(markup).toContain("required");
  });
});
