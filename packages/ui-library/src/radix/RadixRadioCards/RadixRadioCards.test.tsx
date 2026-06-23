import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixRadioCards } from "./RadixRadioCards";

describe("RadixRadioCards", () => {
  it("renders selectable card options with radio semantics", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixRadioCards, {
        defaultValue: "approve",
        id: "review-action",
        name: "reviewAction",
        options: [
          {
            hint: "Record the package as ready.",
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

    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('role="radio"');
    expect(markup).toContain("Record the package as ready.");
    expect(markup).toContain("Approve");
  });
});
