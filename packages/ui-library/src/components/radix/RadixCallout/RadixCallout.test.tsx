import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixCallout } from "./RadixCallout";

describe("RadixCallout", () => {
  it("renders warning callouts as alerts with a Radix icon", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixCallout, {
        children: "Review the planning reason before submitting.",
        title: "Needs review",
        tone: "warning"
      })
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain("Needs review");
    expect(markup).toContain('data-icon="exclamationTriangle"');
  });
});
