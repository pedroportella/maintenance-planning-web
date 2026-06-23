import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RadixTable } from "./RadixTable";

describe("RadixTable", () => {
  it("renders Radix table parts with native table semantics", () => {
    const markup = renderToStaticMarkup(
      createElement(
        RadixTable.Root,
        {
          density: "compact",
          layout: "fixed"
        },
        createElement(RadixTable.Caption, null, "Queue"),
        createElement(
          RadixTable.Header,
          null,
          createElement(
            RadixTable.Row,
            null,
            createElement(RadixTable.ColumnHeaderCell, null, "Work order"),
            createElement(RadixTable.ColumnHeaderCell, { justify: "end" }, "Hours")
          )
        ),
        createElement(
          RadixTable.Body,
          null,
          createElement(
            RadixTable.Row,
            null,
            createElement(RadixTable.RowHeaderCell, null, "WO-1000"),
            createElement(RadixTable.Cell, { justify: "end" }, "4")
          )
        )
      )
    );

    expect(markup).toContain("<table");
    expect(markup).toContain("rt-TableRoot");
    expect(markup).toContain("rt-TableRootTable");
    expect(markup).toContain("rt-r-size-1");
    expect(markup).toContain("radix-table-compact");
    expect(markup).toContain('scope="col"');
    expect(markup).toContain('scope="row"');
    expect(markup).toContain("WO-1000");
  });
});
