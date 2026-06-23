import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixBadge } from "./RadixBadge";

describe("RadixBadge", () => {
  it("renders a Radix badge with status text", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixBadge, {
        children: "Ready",
        tone: "success"
      })
    );

    expect(markup).toContain("Ready");
    expect(markup).toContain("radix-badge");
  });
});
