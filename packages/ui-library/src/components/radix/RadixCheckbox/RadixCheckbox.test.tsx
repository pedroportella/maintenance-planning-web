import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixCheckbox } from "./RadixCheckbox";

describe("RadixCheckbox", () => {
  it("renders a disabled checkbox control", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixCheckbox, {
        disabled: true,
        id: "confirm-review",
        name: "confirmReview"
      })
    );

    expect(markup).toContain('role="checkbox"');
    expect(markup).toContain('id="confirm-review"');
    expect(markup).toContain("disabled");
  });
});
