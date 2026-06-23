import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixTextInput } from "./RadixTextInput";

describe("RadixTextInput", () => {
  it("renders an accessible text input", () => {
    const markup = renderToStaticMarkup(
      createElement(RadixTextInput, {
        "aria-describedby": "package-hint",
        id: "package-number",
        name: "packageNumber",
        placeholder: "Package number"
      })
    );

    expect(markup).toContain("<input");
    expect(markup).toContain('id="package-number"');
    expect(markup).toContain('aria-describedby="package-hint"');
    expect(markup).toContain("radix-text-input");
  });
});
