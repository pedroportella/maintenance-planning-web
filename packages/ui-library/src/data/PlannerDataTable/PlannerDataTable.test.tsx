import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  PlannerDataTable,
  type PlannerDataTableColumn
} from "./PlannerDataTable";

describe("PlannerDataTable", () => {
  it("renders through the current data table contract", () => {
    type Row = {
      status: string;
      workOrder: string;
    };

    const columns: Array<PlannerDataTableColumn<Row>> = [
      {
        header: "Work order",
        key: "work-order",
        render: (row) => row.workOrder
      },
      {
        header: "Status",
        key: "status",
        render: (row) => row.status
      }
    ];

    const markup = renderToStaticMarkup(
      createElement(PlannerDataTable<Row>, {
        caption: "Planner queue",
        columns,
        getRowKey: (row) => row.workOrder,
        rows: [
          {
            status: "Ready",
            workOrder: "WO-1000"
          }
        ]
      })
    );

    expect(markup).toContain("Planner queue");
    expect(markup).toContain("WO-1000");
    expect(markup).toContain("data-table");
  });
});
