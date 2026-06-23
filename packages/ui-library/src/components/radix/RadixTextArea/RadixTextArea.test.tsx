import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixTextArea } from "./RadixTextArea";

describe("RadixTextArea", () => {
  it("renders a textarea with invalid state wiring", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixTextArea, {
        "aria-invalid": true,
        id: "decision-note",
        name: "decisionNote"
      })
    );

    expect(markup).toContain("<textarea");
    expect(markup).toContain('id="decision-note"');
    expect(markup).toContain('aria-invalid="true"');
  });
});
