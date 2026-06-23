import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixTable } from "./RadixTable";

describe("RadixTable", () => {
  it("renders semantic table parts without a Radix runtime dependency", () => {
    const markup = renderToStaticMarkup(
      createElement(
        RadixTable.Root,
        {
          density: "compact"
        },
        createElement(RadixTable.Caption, null, "Queue"),
        createElement(
          RadixTable.Header,
          null,
          createElement(
            RadixTable.Row,
            null,
            createElement(RadixTable.ColumnHeaderCell, null, "Work order")
          )
        ),
        createElement(
          RadixTable.Body,
          null,
          createElement(
            RadixTable.Row,
            null,
            createElement(RadixTable.Cell, null, "WO-1000")
          )
        )
      )
    );

    expect(markup).toContain("<table");
    expect(markup).toContain("radix-table-compact");
    expect(markup).toContain('scope="col"');
    expect(markup).toContain("WO-1000");
  });
});
