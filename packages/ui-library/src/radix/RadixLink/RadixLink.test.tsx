import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixLink } from "./RadixLink";

describe("RadixLink", () => {
  it("renders an accessible anchor without framework router details", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixLink, {
        "aria-current": "page",
        children: "Recommendation queue",
        href: "/recommendations"
      })
    );

    expect(markup).toContain("<a");
    expect(markup).toContain('href="/recommendations"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("Recommendation queue");
  });
});
