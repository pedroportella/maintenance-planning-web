import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixHeading } from "./RadixHeading";

describe("RadixHeading", () => {
  it("renders the requested heading level", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixHeading, {
        as: "h3",
        children: "Adapter states"
      })
    );

    expect(markup).toContain("<h3");
    expect(markup).toContain("Adapter states");
    expect(markup).toContain("radix-heading");
  });
});
