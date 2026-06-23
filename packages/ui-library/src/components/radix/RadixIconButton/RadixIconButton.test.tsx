import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixIcon } from "../RadixIcon";
import { RadixIconButton } from "./RadixIconButton";

describe("RadixIconButton", () => {
  it("renders an accessible icon-only Radix button", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixIconButton, {
        children: createElement(RadixIcon, {
          decorative: true,
          name: "arrowRight"
        }),
        label: "Next page",
        tone: "neutral",
        variant: "soft"
      })
    );

    expect(markup).toContain('aria-label="Next page"');
    expect(markup).toContain("radix-icon-button");
    expect(markup).toContain("rt-IconButton");
  });
});
