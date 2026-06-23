import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixText } from "./RadixText";

describe("RadixText", () => {
  it("renders semantic text variants", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixText, {
        as: "p",
        children: "Only synthetic planner notes are shown.",
        tone: "muted"
      })
    );

    expect(markup).toContain("<p");
    expect(markup).toContain("Only synthetic planner notes are shown.");
    expect(markup).toContain("radix-text");
  });
});
