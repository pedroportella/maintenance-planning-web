import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlannerTableCellStack } from "./PlannerTableCellStack";

describe("PlannerTableCellStack", () => {
  it("renders compact title and detail content for data table cells", () => {
    const markup = renderToStaticMarkup(
      createElement(PlannerTableCellStack, {
        detail: "Baseline weekly package",
        title: "PKG-BASE-001"
      })
    );

    expect(markup).toContain("planner-table-cell-stack");
    expect(markup).toContain("planner-table-cell-stack-title");
    expect(markup).toContain("Baseline weekly package");
  });
});
