import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  PlannerDataTable,
  type PlannerDataTableColumn
} from "./PlannerDataTable";

describe("PlannerDataTable", () => {
  it("renders the current column contract through Radix table markup", () => {
    type Row = {
      hours: string;
      status: string;
      workOrder: string;
    };

    const columns: Array<PlannerDataTableColumn<Row>> = [
      {
        header: "Work order",
        key: "work-order",
        render: (row) => row.workOrder,
        rowHeader: true
      },
      {
        header: "Status",
        key: "status",
        render: (row) => row.status
      },
      {
        align: "end",
        header: "Hours",
        key: "hours",
        render: (row) => row.hours
      }
    ];

    const markup = renderToStaticMarkup(
      createElement(PlannerDataTable<Row>, {
        caption: "Planner queue",
        columns,
        density: "compact",
        getRowKey: (row) => row.workOrder,
        rows: [
          {
            hours: "4",
            status: "Ready",
            workOrder: "WO-1000"
          }
        ]
      })
    );

    expect(markup).toContain("Planner queue");
    expect(markup).toContain("WO-1000");
    expect(markup).toContain("rt-TableRoot");
    expect(markup).toContain("planner-data-table");
    expect(markup).toContain("data-table");
    expect(markup).toContain('scope="row"');
    expect(markup).toContain('data-align="end"');
  });

  it("renders an empty state inside a valid table row", () => {
    type Row = {
      workOrder: string;
    };

    const columns: Array<PlannerDataTableColumn<Row>> = [
      {
        header: "Work order",
        key: "work-order",
        render: (row) => row.workOrder
      }
    ];

    const markup = renderToStaticMarkup(
      createElement(PlannerDataTable<Row>, {
        caption: "Empty planner queue",
        columns,
        getRowKey: (row) => row.workOrder,
        rows: []
      })
    );

    expect(markup).toContain("No rows to show");
    expect(markup).toContain('colSpan="1"');
    expect(markup).toContain("planner-data-table-empty");
  });
});
