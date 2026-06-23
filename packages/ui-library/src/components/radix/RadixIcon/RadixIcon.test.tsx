import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixIcon } from "./RadixIcon";

describe("RadixIcon", () => {
  it("hides decorative icons from assistive technology", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixIcon, {
        name: "checkCircled"
      })
    );

    expect(markup).toContain('data-icon="checkCircled"');
    expect(markup).toContain('aria-hidden="true"');
  });

  it("uses Radix AccessibleIcon for labelled icons", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixIcon, {
        decorative: false,
        label: "Search work orders",
        name: "magnifyingGlass"
      })
    );

    expect(markup).toContain("Search work orders");
    expect(markup).toContain("position:absolute");
  });
});
