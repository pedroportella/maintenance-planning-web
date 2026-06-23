import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixSpinner } from "./RadixSpinner";

describe("RadixSpinner", () => {
  it("renders the Radix spinner class through the local adapter", () => {
    const markup = renderToStaticMarkup(createElement(RadixSpinner, { size: "2" }));

    expect(markup).toContain("rt-Spinner");
    expect(markup).toContain("radix-spinner");
  });
});
