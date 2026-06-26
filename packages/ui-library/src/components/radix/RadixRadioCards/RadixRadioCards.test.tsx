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

  it("renders disabled options with visible unavailable state while preserving radio semantics", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixRadioCards, {
        defaultValue: "defer",
        id: "review-action",
        name: "reviewAction",
        options: [
          {
            disabled: true,
            hint: "Cannot accept yet: missing estimate.",
            label: "Accept package",
            value: "accept"
          },
          {
            label: "Defer package",
            value: "defer"
          }
        ]
      })
    );

    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('data-disabled=""');
    expect(markup).toContain('disabled=""');
    expect(markup).toContain("radix-radio-card-disabled");
    expect(markup).toContain("Unavailable");
    expect(markup).toContain("Cannot accept yet: missing estimate.");
  });
});
