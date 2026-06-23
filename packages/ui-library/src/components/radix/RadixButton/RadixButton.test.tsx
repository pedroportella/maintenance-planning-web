import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixButton } from "./RadixButton";

describe("RadixButton", () => {
  it("renders a disabled Radix Themes button with a safe default type", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixButton, {
        children: "Apply decision",
        disabled: true,
        tone: "success"
      })
    );

    expect(markup).toContain("<button");
    expect(markup).toContain('type="button"');
    expect(markup).toContain("disabled");
    expect(markup).toContain("Apply decision");
    expect(markup).toContain("radix-button");
  });
});
