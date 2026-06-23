import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  RadixDataListItem,
  RadixDataListLabel,
  RadixDataListRoot,
  RadixDataListValue
} from "./RadixDataList";

describe("RadixDataList", () => {
  it("renders Radix DataList semantics through the local adapter", () => {
    const markup = renderToStaticMarkup(
      createElement(
        RadixDataListRoot,
        {
          "aria-label": "Package facts",
          orientation: "horizontal",
          size: "2"
        },
        createElement(
          RadixDataListItem,
          null,
          createElement(RadixDataListLabel, null, "Score"),
          createElement(RadixDataListValue, null, "91")
        )
      )
    );

    expect(markup).toContain("<dl");
    expect(markup).toContain("<dt");
    expect(markup).toContain("<dd");
    expect(markup).toContain("rt-DataListRoot");
    expect(markup).toContain("radix-data-list");
    expect(markup).toContain('aria-label="Package facts"');
  });
});
