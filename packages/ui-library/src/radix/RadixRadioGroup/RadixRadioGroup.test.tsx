import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixRadioGroup } from "./RadixRadioGroup";

describe("RadixRadioGroup", () => {
  it("renders radio roles, labels and disabled options", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixRadioGroup, {
        id: "decision-action",
        name: "decisionAction",
        options: [
          {
            label: "Approve",
            value: "approve"
          },
          {
            disabled: true,
            hint: "Blocked until the review state is ready.",
            label: "Defer",
            value: "defer"
          }
        ]
      })
    );

    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('role="radio"');
    expect(markup).toContain('for="decision-action-approve"');
    expect(markup).toContain("Blocked until the review state is ready.");
    expect(markup).toContain("disabled");
  });
});
